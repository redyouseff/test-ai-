
import { useState } from 'react';
import { nanoid } from 'nanoid';
import ChatInterface from './ChatInterface';
import { Message, DiagnosticFile } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock AI responses
const aiResponses = {
  greeting: "Hello doctor! I'm your AI medical assistant. How can I help with your patients today?",
  appointment: "I can help you schedule patient appointments efficiently. What date range would work for you?",
  symptoms: "Based on the described symptoms and uploaded files, my analysis suggests the following potential conditions...",
  diagnosis: "After analyzing the uploaded scan, I've detected signs of an abnormal growth that may indicate early-stage cancer with 87% confidence. I recommend further testing to confirm.",
  treatment: "Based on the diagnosis results, a possible treatment plan could include targeted radiation therapy followed by regular monitoring.",
  summary: "Here's a summary of the patient's condition based on the medical history and recent tests...",
};

// Function to generate AI response
const generateAIResponse = (message: string): string => {
  message = message.toLowerCase();
  
  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return aiResponses.greeting;
  } else if (message.includes('appointment') || message.includes('schedule') || message.includes('book')) {
    return aiResponses.appointment;
  } else if (message.includes('symptom') || message.includes('pain') || message.includes('feel')) {
    return aiResponses.symptoms;
  } else if (message.includes('diagnosis') || message.includes('analyze') || message.includes('scan')) {
    return aiResponses.diagnosis;
  } else if (message.includes('treatment') || message.includes('plan') || message.includes('recommend')) {
    return aiResponses.treatment;
  } else if (message.includes('summary') || message.includes('recap')) {
    return aiResponses.summary;
  } else {
    return "I can help with patient diagnosis, treatment planning, and scheduling. Could you provide more details about what you need assistance with?";
  }
};

export default function AIChatAssistant() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: nanoid(),
      senderId: 'ai-bot',
      receiverId: currentUser?.id || 'user',
      content: "Hello Doctor! I'm your AI medical assistant. I can help you analyze patient scans, suggest diagnoses, develop treatment plans, and more. How can I assist you today?",
      timestamp: new Date().toISOString(),
      read: true
    }
  ]);

  if (!currentUser || currentUser.role !== 'doctor') {
    return (
      <Card className="flex flex-col items-center justify-center h-[400px]">
        <CardContent className="text-center p-6">
          <Bot className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">AI Assistant</h3>
          <p className="text-gray-500 mb-6">
            The AI medical assistant is only available for doctors.
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleSendMessage = (content: string, attachments?: DiagnosticFile[]) => {
    // Add user message
    const userMessage: Message = {
      id: nanoid(),
      senderId: currentUser?.id || 'user',
      receiverId: 'ai-bot',
      content,
      timestamp: new Date().toISOString(),
      read: true,
      attachments
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Generate AI response after a short delay
    setTimeout(() => {
      // Include a reference to attachments in the response if they were included
      let aiResponse = generateAIResponse(content);
      if (attachments && attachments.length > 0) {
        aiResponse = `I've analyzed the ${attachments.length} file(s) you've shared. ${aiResponse}`;
      }
      
      const aiMessage: Message = {
        id: nanoid(),
        senderId: 'ai-bot',
        receiverId: currentUser?.id || 'user',
        content: aiResponse,
        timestamp: new Date().toISOString(),
        read: true
      };
      
      setMessages(prev => [...prev, aiMessage]);
    }, 1500);
  };

  return (
    <ChatInterface 
      isAIAssistant
      messages={messages}
      onSendMessage={handleSendMessage}
    />
  );
}
