import { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/types';
import { mockMessages, mockDoctors, mockPatients } from '@/data/mockData';
import { Message, DoctorProfile, PatientProfile, DiagnosticFile } from '@/types';
import ChatInterface from '@/components/chat/ChatInterface';
import AIChatAssistant from '@/components/chat/AIChatAssistant';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Search, User } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function Messages() {
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [selectedContactName, setSelectedContactName] = useState<string>('');
  const [contacts, setContacts] = useState<(DoctorProfile | PatientProfile)[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState("contacts");

  // Load contacts based on user role
  useEffect(() => {
    if (!currentUser) return;

    if (currentUser.role === 'patient') {
      setContacts(mockDoctors);
    } else {
      setContacts(mockPatients);
    }
  }, [currentUser]);

  // Load messages for the selected contact
  useEffect(() => {
    if (!currentUser || !selectedContact) return;

    const filteredMessages = mockMessages.filter(
      (message) => 
        (message.senderId === currentUser.id && message.receiverId === selectedContact) ||
        (message.senderId === selectedContact && message.receiverId === currentUser.id)
    );

    setMessages(filteredMessages.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    ));
  }, [currentUser, selectedContact]);

  // Set contact name when selecting a contact
  useEffect(() => {
    if (selectedContact) {
      const contact = contacts.find(c => c.id === selectedContact);
      if (contact) {
        setSelectedContactName(contact.name);
      }
    }
  }, [selectedContact, contacts]);

  // Filter contacts by search term
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = (content: string, attachments?: DiagnosticFile[]) => {
    if (!currentUser || !selectedContact) return;

    const newMessage: Message = {
      id: nanoid(),
      senderId: currentUser.id,
      receiverId: selectedContact,
      content,
      timestamp: new Date().toISOString(),
      read: false,
      attachments
    };

    // Add new message to the list
    setMessages(prevMessages => [...prevMessages, newMessage]);
    
    // In a real app, you'd send this message to a backend/API
    // For now, we'll just add it to our local state
  };

  if (!currentUser) {
    return (
      <DashboardLayout>
        <div className="text-center py-10">
          <p>Please log in to view your messages.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left side - Contacts or AI Assistant */}
          <div className="md:col-span-1">
            {currentUser.role === 'doctor' ? (
              <Tabs defaultValue="contacts" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="contacts" className="flex-1">Contacts</TabsTrigger>
                  <TabsTrigger value="ai" className="flex-1">AI Assistant</TabsTrigger>
                </TabsList>
                
                <TabsContent value="contacts" className="space-y-4">
                  <ContactsList 
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filteredContacts={filteredContacts}
                    selectedContact={selectedContact}
                    setSelectedContact={setSelectedContact}
                    currentUser={currentUser}
                  />
                </TabsContent>
                
                <TabsContent value="ai">
                  <AIChatAssistant forDoctors={true} />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search contacts..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <Card>
                  <ScrollArea className="h-[500px]">
                    {filteredContacts.length > 0 ? (
                      <CardContent className="p-2">
                        {filteredContacts.map((contact) => (
                          <div
                            key={contact.id}
                            onClick={() => setSelectedContact(contact.id)}
                            className={`flex items-center gap-3 p-3 rounded-md cursor-pointer hover:bg-gray-100 ${
                              selectedContact === contact.id ? 'bg-gray-100' : ''
                            }`}
                          >
                            <Avatar className="h-10 w-10 bg-primary-light">
                              {contact.profileImage ? (
                                <img
                                  src={contact.profileImage}
                                  alt={contact.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <User className="h-5 w-5 text-primary-dark" />
                              )}
                            </Avatar>
                            <div>
                              <p className="font-medium">{contact.name}</p>
                              <p className="text-xs text-gray-500">
                                {currentUser.role === 'patient'
                                  ? (contact as DoctorProfile).specialty?.replace('-', ' ')
                                  : 'Patient'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    ) : (
                      <CardContent className="p-6 text-center">
                        <p className="text-gray-500">No contacts found</p>
                      </CardContent>
                    )}
                  </ScrollArea>
                </Card>
              </div>
            )}
          </div>
          
          {/* Right side - Chat Interface */}
          <div className="md:col-span-2">
            {selectedContact && activeTab === "contacts" ? (
              <ChatInterface
                recipientId={selectedContact}
                recipientName={selectedContactName}
                messages={messages}
                onSendMessage={handleSendMessage}
              />
            ) : activeTab === "contacts" ? (
              <Card className="flex items-center justify-center h-[600px] border">
                <div className="text-center p-6">
                  <User className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <h3 className="text-lg font-medium text-gray-700">Select a contact</h3>
                  <p className="text-gray-500 max-w-xs mx-auto mt-2">
                    Choose a contact from the list to start a conversation
                  </p>
                </div>
              </Card>
            ) : null}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ContactsList component extracted for better readability
interface ContactsListProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredContacts: (DoctorProfile | PatientProfile)[];
  selectedContact: string | null;
  setSelectedContact: (id: string) => void;
  currentUser: any;
}

function ContactsList({ 
  searchTerm, 
  setSearchTerm, 
  filteredContacts, 
  selectedContact, 
  setSelectedContact,
  currentUser
}: ContactsListProps) {
  return (
    <>
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search contacts..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card>
        <ScrollArea className="h-[500px]">
          {filteredContacts.length > 0 ? (
            <CardContent className="p-2">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContact(contact.id)}
                  className={`flex items-center gap-3 p-3 rounded-md cursor-pointer hover:bg-gray-100 ${
                    selectedContact === contact.id ? 'bg-gray-100' : ''
                  }`}
                >
                  <Avatar className="h-10 w-10 bg-primary-light">
                    {contact.profileImage ? (
                      <img
                        src={contact.profileImage}
                        alt={contact.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-primary-dark" />
                    )}
                  </Avatar>
                  <div>
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-xs text-gray-500">
                      {currentUser.role === 'patient'
                        ? (contact as DoctorProfile).specialty?.replace('-', ' ')
                        : 'Patient'}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          ) : (
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">No contacts found</p>
            </CardContent>
          )}
        </ScrollArea>
      </Card>
    </>
  );
}
