import { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import DashboardLayout from "../components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SearchIcon, SendIcon, ImageIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const API_BASE_URL = "https://care-insight-api-9ed25d3ea3ea.herokuapp.com";
const SOCKET_URL = "https://care-insight-api-9ed25d3ea3ea.herokuapp.com";

interface User {
  _id: string;
  email: string;
  profileImage?: string;
  fullName?: string;
  lastMessage?: {
    createdAt: string;
    senderId: string;
    text?: string;
    image?: string;
  };
  isOnline: boolean;
}

interface UserDetails extends User {
  name?: string;
}

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  text?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserData {
  _id: string;
  doctors?: Array<{
    _id: string;
    fullName: string;
    email: string;
  }>;
}

const Messages = () => {
  const { userId } = useParams();
  const location = useLocation();
  const pathDirectUserId = location.pathname.split("/message/")[1];
  const targetUserId = userId || pathDirectUserId || null;
  const { state } = location;
  const partnerFromState = state?.partner;
  const appointmentFromState = state?.appointment;

  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(targetUserId);
  const [newMessage, setNewMessage] = useState("");
  const { toast } = useToast();
  const [selectedUserDetails, setSelectedUserDetails] =
    useState<UserDetails | null>(partnerFromState || null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const currentUserId = localStorage.getItem("userId");
  const [currentUserData, setCurrentUserData] = useState<User | null>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (partnerFromState && targetUserId) {
      setSelectedUser(targetUserId);
      setSelectedUserDetails(partnerFromState);

      // If we have an appointment context, send an initial message about the appointment
      if (appointmentFromState && !messages.length) {
        const appointmentDate = new Date(appointmentFromState.appointmentDate);
        const formattedDate = appointmentDate.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        setNewMessage(
          `Regarding our appointment on ${formattedDate} - ${appointmentFromState.reasonForVisit}`
        );
      }
    }
  }, [partnerFromState, targetUserId, appointmentFromState]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/v1/message/users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      const currentUserId = localStorage.getItem("userId");
      const filteredUsers = data.filter(
        (user: User) => user._id !== currentUserId
      );

      const sortedUsers = filteredUsers.sort((a: User, b: User) => {
        const dateA = a.lastMessage?.createdAt
          ? new Date(a.lastMessage.createdAt)
          : new Date(0);
        const dateB = b.lastMessage?.createdAt
          ? new Date(b.lastMessage.createdAt)
          : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      setUsers(sortedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchMessages = async (userId: string) => {
    if (!userId) {
      console.warn("No userId provided to fetchMessages");
      return;
    }

    try {
      setLoadingMessages(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/v1/message/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status}`);
      }

      const messages = await response.json();
      setMessages(messages);
      scrollToBottom();
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingMessages(false);
    }
  };

  const fetchSelectedUserDetails = async (userId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === "success") {
          setSelectedUserDetails(data.data.user);
        }
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  useEffect(() => {
    if (!currentUserId) {
      console.log("No currentUserId found");
      return;
    }

    console.log("Attempting to connect to socket with userId:", currentUserId);
    const newSocket = io(SOCKET_URL, {
      query: { userId: currentUserId },
      withCredentials: true,
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      extraHeaders: {
        "Access-Control-Allow-Origin": "*",
      },
    });

    newSocket.on("connect", () => {
      console.log("Socket connected successfully. Socket ID:", newSocket.id);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected. Reason:", reason);
    });

    newSocket.on("receiveMessage", (newMessage: Message) => {
      console.log("Received new message:", newMessage);
      console.log("Current selected user:", selectedUser);
      console.log("Current user ID:", currentUserId);

      setMessages((prev) => {
        console.log("Previous messages:", prev);
        const messageExists = prev.some((msg) => msg._id === newMessage._id);
        if (messageExists) {
          console.log("Message already exists in state");
          return prev;
        }
        console.log("Adding new message to state");
        return [...prev, newMessage];
      });

      fetchUsers();
      scrollToBottom();
    });

    newSocket.on("onlineUsers", (users: string[]) => {
      setOnlineUsers(users);
    });

    setSocket(newSocket);

    return () => {
      console.log("Cleaning up socket connection");
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [currentUserId]);

  const formatMessageDate = (dateString: string) => {
    try {
      if (!dateString) return "";

      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";

      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);

      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      };

      if (date.toDateString() === now.toDateString()) {
        return new Intl.DateTimeFormat("ar", timeOptions).format(date);
      }

      if (date.toDateString() === yesterday.toDateString()) {
        return `الأمس ${new Intl.DateTimeFormat("ar", timeOptions).format(
          date
        )}`;
      }

      return new Intl.DateTimeFormat("ar", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }).format(date);
    } catch (error) {
      console.error("Date formatting error:", error);
      return "";
    }
  };

  const sendMessage = async () => {
    if (!selectedUser || (!newMessage.trim() && !selectedImage)) {
      console.log("Invalid send message attempt:", {
        selectedUser,
        newMessage,
        selectedImage,
      });
      return;
    }

    console.log("Attempting to send message to:", selectedUser);
    const token = localStorage.getItem("token");
    const messageText = newMessage.trim();

    setNewMessage("");
    setSelectedImage(null);

    try {
      const formData = new FormData();

      if (messageText) {
        formData.append("text", messageText);
      }

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      console.log("Sending message request...");
      const response = await fetch(
        `${API_BASE_URL}/api/v1/message/${selectedUser}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`);
      }

      const data = await response.json();
      console.log("Message sent successfully:", data);

      setMessages((prev) => [...prev, data.message]);

      if (socket) {
        console.log("Emitting message through socket");
        socket.emit("sendMessage", {
          receiverId: selectedUser,
          message: data.message,
        });
      } else {
        console.warn("No socket connection available");
      }

      await fetchUsers();
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    console.log("Current users:", users);
  }, [users]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchSelectedUserDetails(selectedUser);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (targetUserId) {
      setSelectedUser(targetUserId);
    }
  }, [targetUserId]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (!selectedUser) return;

    const interval = setInterval(() => {
      fetchMessages(selectedUser);
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedUser]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setCurrentUserData(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const fixImageUrl = (url: string | undefined): string => {
    if (!url) return "";
    if (url.includes("placeholder.svg")) return "";
    if (url.includes("localhost:8000/users/")) {
      return url.split("localhost:8000/users/")[1];
    }
    return url;
  };

  const renderUserItem = (user: User) => {
    if (!user || !user._id) return null;

    const isOnline = onlineUsers.includes(user._id);
    const isSelected = selectedUser === user._id;
    const profileImage =
      user.profileImage && !user.profileImage.includes("placeholder.svg")
        ? user.profileImage
        : null;

    return (
      <div
        key={user._id}
        onClick={() => {
          setSelectedUser(user._id);
          fetchSelectedUserDetails(user._id);
        }}
        className={`w-full p-3 flex items-center gap-3 hover:bg-gray-50 transition-all cursor-pointer ${
          isSelected ? "bg-gray-50 border-l-4 border-primary" : ""
        }`}
      >
        <div className="relative flex-shrink-0">
          <Avatar className="h-12 w-12 border rounded-full">
            {profileImage ? (
              <AvatarImage
                src={profileImage}
                alt={user.fullName || user.email || ""}
                className="object-cover"
              />
            ) : (
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {user.fullName
                  ? user.fullName
                      .split(" ")
                      .map((name) => name[0])
                      .join("")
                      .toUpperCase()
                  : user.email
                  ? user.email.charAt(0).toUpperCase()
                  : "?"}
              </AvatarFallback>
            )}
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                isOnline ? "bg-green-500" : "bg-gray-300"
              }`}
              title={isOnline ? "Online" : "Offline"}
            />
          </Avatar>
        </div>

        <div className="flex-1 min-w-0 text-right">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-start">
              <p className="font-semibold text-gray-900 truncate">
                {user.fullName || user.email || "Unknown User"}
              </p>
              {user.fullName && user.email && (
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              )}
            </div>
            {user.lastMessage && (
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {formatMessageDate(user.lastMessage.createdAt)}
              </span>
            )}
          </div>
          {user.lastMessage && (
            <p className="text-sm text-gray-500 truncate mt-1 text-right">
              {user.lastMessage.senderId === currentUserData?._id
                ? "You: "
                : ""}
              {user.lastMessage.text || (user.lastMessage.image ? "Image" : "")}
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderChatHeader = () => {
    if (!selectedUser || !selectedUserDetails) return null;

    return (
      <div className="p-4 border-b bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border rounded-full">
            {selectedUserDetails.profileImage &&
            !selectedUserDetails.profileImage.includes("placeholder.svg") ? (
              <AvatarImage
                src={selectedUserDetails.profileImage}
                alt={
                  selectedUserDetails.fullName ||
                  selectedUserDetails.email ||
                  ""
                }
                className="object-cover"
              />
            ) : (
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {selectedUserDetails.fullName
                  ? selectedUserDetails.fullName
                      .split(" ")
                      .map((name) => name[0])
                      .join("")
                      .toUpperCase()
                  : selectedUserDetails.email
                  ? selectedUserDetails.email.charAt(0).toUpperCase()
                  : "?"}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">
              {selectedUserDetails.fullName ||
                selectedUserDetails.email ||
                "Unknown User"}
            </span>
            {selectedUserDetails.fullName && selectedUserDetails.email && (
              <span className="text-xs text-gray-500">
                {selectedUserDetails.email}
              </span>
            )}
            <span className="text-xs text-gray-500">
              {onlineUsers.includes(selectedUser) ? "Online" : "Offline"}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex h-[calc(100vh-200px)] gap-4">
          {/* Users Sidebar */}
          <div className="w-80 flex flex-col bg-white shadow-sm border-r h-full">
            {/* Search Header */}
            <div className="p-4 border-b">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Users List */}
            <ScrollArea className="flex-1">
              <div className="divide-y">
                {loadingUsers ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  filteredUsers.map((user) =>
                    user ? renderUserItem(user) : null
                  )
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Messages Area */}
          <div className="flex-1 border rounded-lg flex flex-col bg-gray-50 shadow-sm overflow-hidden">
            {selectedUser ? (
              <>
                {renderChatHeader()}
                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto bg-[#f0f2f5] p-4">
                  {messages.map((message, index) => {
                    const messageIsSentByMe =
                      message.senderId === currentUserData?._id;

                    return (
                      <div
                        key={message._id}
                        className="w-full flex mb-3"
                        style={{
                          justifyContent: messageIsSentByMe
                            ? "flex-end"
                            : "flex-start",
                        }}
                      >
                        {!messageIsSentByMe && (
                          <div className="flex-shrink-0 mr-2">
                            <Avatar className="h-8 w-8">
                              {selectedUserDetails?.profileImage && (
                                <AvatarImage
                                  src={fixImageUrl(
                                    selectedUserDetails.profileImage
                                  )}
                                  alt={
                                    selectedUserDetails.fullName ||
                                    selectedUserDetails.email
                                  }
                                  className="object-cover"
                                />
                              )}
                              <AvatarFallback>
                                {(
                                  selectedUserDetails?.fullName ||
                                  selectedUserDetails?.email
                                )
                                  ?.charAt(0)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        )}

                        <div
                          className={`max-w-[80%] ${
                            messageIsSentByMe
                              ? "bg-[#dcf8c6] rounded-lg p-3 shadow"
                              : "bg-white rounded-lg p-3 shadow"
                          }`}
                        >
                          {!messageIsSentByMe && (
                            <div className="text-xs text-gray-600 mb-1">
                              {selectedUserDetails?.fullName ||
                                selectedUserDetails?.email}
                            </div>
                          )}

                          {message.image && (
                            <img
                              src={fixImageUrl(message.image)}
                              alt="Attached"
                              className="max-w-full rounded mb-2 max-h-60 object-contain"
                            />
                          )}
                          {message.text && (
                            <p className="text-gray-800">{message.text}</p>
                          )}
                          <span
                            className={`text-xs text-gray-500 mt-1 block ${
                              messageIsSentByMe ? "text-right" : "text-left"
                            }`}
                          >
                            {formatMessageDate(message.createdAt)}
                          </span>
                        </div>

                        {messageIsSentByMe && (
                          <div className="text-xs text-gray-400 self-end ml-2">
                            ✓
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t bg-white shadow-sm">
                  <div className="flex flex-col gap-2 max-w-4xl mx-auto">
                    {selectedImage && (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">
                          Selected image: {selectedImage.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedImage(null)}
                          className="h-6 w-6 p-0 hover:bg-gray-200"
                        >
                          ×
                        </Button>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <Button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() && !selectedImage}
                        className="bg-primary hover:bg-primary/90 text-white transition-colors"
                      >
                        <SendIcon className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          document.getElementById("image-upload")?.click()
                        }
                        className="hover:bg-gray-100 transition-colors"
                      >
                        <ImageIcon className="h-5 w-5" />
                      </Button>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        id="image-upload"
                      />
                      <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        className="flex-1 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">
                    Welcome to Messages
                  </h3>
                  <p className="text-sm text-gray-400">
                    Select a user to start chatting
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Messages;
