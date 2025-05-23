import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Paperclip, File as FileIcon } from 'lucide-react';
import { Message, DiagnosticFile } from '@/types';
import { nanoid } from 'nanoid';

interface ChatInterfaceProps {
  recipientId?: string;
  recipientName?: string;
  isAIAssistant?: boolean;
  messages: Message[];
  onSendMessage: (message: string, attachments?: DiagnosticFile[]) => void;
}

export default function ChatInterface({
  recipientId,
  recipientName = 'Chat',
  isAIAssistant = false,
  messages,
  onSendMessage,
}: ChatInterfaceProps) {
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState<DiagnosticFile[]>([]);
  const [isAttaching, setIsAttaching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if ((newMessage.trim() || attachments.length > 0)) {
      onSendMessage(newMessage, attachments.length > 0 ? attachments : undefined);
      setNewMessage('');
      setAttachments([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsAttaching(true);
    
    // Convert selected files to DiagnosticFile objects
    const newAttachments: DiagnosticFile[] = Array.from(files).map(file => ({
      id: nanoid(),
      patientId: currentUser?.role === 'patient' ? currentUser?.id : recipientId || '',
      appointmentId: '',
      fileUrl: URL.createObjectURL(file),
      fileName: file.name,
      uploadDate: new Date().toISOString(),
      fileType: file.type
    }));

    // Simulate upload delay
    setTimeout(() => {
      setAttachments(prev => [...prev, ...newAttachments]);
      setIsAttaching(false);
    }, 1000);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter(file => file.id !== id));
  };

  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Card className="flex flex-col h-[600px] border">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b flex items-center gap-3">
        <Avatar className="h-9 w-9 bg-primary-light">
          {isAIAssistant ? (
            <Bot className="h-5 w-5 text-primary-dark" />
          ) : (
            <User className="h-5 w-5 text-primary-dark" />
          )}
        </Avatar>
        <div>
          <h3 className="font-medium">
            {isAIAssistant ? 'AI Assistant' : recipientName}
          </h3>
          <p className="text-xs text-gray-500">
            {isAIAssistant ? 'Medical AI Bot' : 'Online'}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length > 0 ? (
            messages.map((message) => {
              const isCurrentUser = message.senderId === currentUser?.id;
              const isAI = message.senderId === 'ai-bot';

              return (
                <div
                  key={message.id}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2 rounded-lg ${
                      isCurrentUser
                        ? 'bg-primary text-white rounded-br-none'
                        : isAI
                        ? 'bg-purple-100 text-gray-800 rounded-bl-none'
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    {isAI && (
                      <div className="flex items-center gap-1 mb-1 text-xs text-gray-500">
                        <Bot className="h-3.5 w-3.5" />
                        <span>AI Bot</span>
                      </div>
                    )}
                    <p className="text-sm">{message.content}</p>
                    
                    {/* Render file attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.attachments.map(file => (
                          <div 
                            key={file.id}
                            className={`flex items-center p-2 rounded-md ${
                              isCurrentUser ? 'bg-primary-dark' : 'bg-gray-200'
                            }`}
                          >
                            <FileIcon className={`h-4 w-4 mr-2 ${isCurrentUser ? 'text-white' : 'text-gray-700'}`} />
                            <span className={`text-xs ${isCurrentUser ? 'text-white' : 'text-gray-700'}`}>
                              {file.fileName}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <p className="text-xs text-right mt-1 opacity-70">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-gray-500 py-10">
              <p>{isAIAssistant ? 'Ask the AI assistant a question' : 'Start a conversation'}</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="px-3 py-2 border-t flex flex-wrap gap-2">
          {attachments.map(file => (
            <div key={file.id} className="bg-gray-100 rounded px-2 py-1 flex items-center text-sm">
              <FileIcon className="h-3 w-3 mr-1 text-gray-500" />
              <span className="truncate max-w-[100px]">{file.fileName}</span>
              <button 
                onClick={() => removeAttachment(file.id)}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
          ))}
          {isAttaching && (
            <div className="bg-gray-100 rounded px-2 py-1 flex items-center text-sm">
              <span className="animate-pulse">Uploading...</span>
            </div>
          )}
        </div>
      )}

      {/* Message Input */}
      <div className="p-3 border-t flex items-center gap-2">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          multiple 
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={openFileSelector}
          className="text-gray-500"
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        <Input
          placeholder={isAIAssistant ? "Ask the AI a question..." : "Type a message..."}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button 
          size="icon" 
          onClick={handleSendMessage} 
          disabled={!newMessage.trim() && attachments.length === 0}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
