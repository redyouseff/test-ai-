import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, UserIcon, FileTextIcon, XIcon, CheckIcon, PlusIcon, SendIcon, SearchIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface AppointmentDetails {
  _id: string;
  appointmentDate: string;
  status: string;
  reasonForVisit: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  appointmentReport?: {
    treatment: {
      medications: Medication[];
      recommendations: string[];
    };
    followUp: {
      required: boolean;
      notes?: string;
    };
    diagnosis: string;
    symptoms: string[];
    completedAt: string;
  };
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface AppointmentReport {
  diagnosis: string;
  symptoms: string[];
  treatment: {
    medications: Medication[];
    recommendations: string[];
  };
  followUp: {
    required: boolean;
    notes?: string;
  };
}

interface CompletionDetails {
  diagnosis: string;
  symptoms: string[];
  treatment: {
    medications: Medication[];
    recommendations: string[];
  };
  followUp: {
    required: boolean;
    notes?: string;
  };
}

interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
    role: string;
  };
  content: string;
  createdAt: string;
}

interface User {
  _id: string;
  name: string;
  role: string;
  profileImage?: string;
  lastMessage?: {
    content: string;
    createdAt: string;
  };
}

const API_BASE_URL = 'https://care-insight-api-9ed25d3ea3ea.herokuapp.com';

const getStatusBadgeStyle = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'bg-green-50 text-green-700';
    case 'cancelled':
      return 'bg-red-50 text-red-700';
    case 'confirmed':
      return 'bg-blue-50 text-blue-700';
    case 'pending':
      return 'bg-yellow-50 text-yellow-700';
    default:
      return 'bg-gray-50 text-gray-700';
  }
};

const AppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDoctor, setIsDoctor] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [completionDetails, setCompletionDetails] = useState<AppointmentReport>({
    diagnosis: '',
    symptoms: [],
    treatment: {
      medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
      recommendations: []
    },
    followUp: {
      required: false,
      notes: ''
    }
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  useEffect(() => {
    // Get the full user data from localStorage
    const userData = localStorage.getItem('userData');
    console.log('User Data from localStorage:', userData);

    if (userData) {
      try {
        const user = JSON.parse(userData);
        console.log('Parsed user data:', user);
        setIsDoctor(user.userType === 'doctor' || user.role === 'doctor');
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    const fetchAppointmentDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/v1/appointments/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        console.log('Appointment data:', data);
        if (data.status === 'success') {
          setAppointment(data.data);
        }
      } catch (error) {
        console.error('Error fetching appointment details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAppointmentDetails();
    }
  }, [id]);

  const handleCancel = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/v1/appointments/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'cancelled' })
      });

      if (response.ok) {
        navigate('/appointments');
      }
    } catch (error) {
      console.error('Error canceling appointment:', error);
    }
  };

  const handleAddMedication = () => {
    setCompletionDetails(prev => ({
      ...prev,
      treatment: {
        ...prev.treatment,
        medications: [...prev.treatment.medications, { name: '', dosage: '', frequency: '', duration: '' }]
      }
    }));
  };

  const handleMedicationChange = (index: number, field: keyof Medication, value: string) => {
    setCompletionDetails(prev => {
      const newMedications = [...prev.treatment.medications];
      newMedications[index] = { ...newMedications[index], [field]: value };
      return {
        ...prev,
        treatment: {
          ...prev.treatment,
          medications: newMedications
        }
      };
    });
  };

  const handleComplete = async () => {
    try {
      const token = localStorage.getItem('token');
      const completeUrl = `${API_BASE_URL}/api/v1/appointments/${id}/complete`;

      console.log('Appointment ID:', id);
      console.log('Complete URL:', completeUrl);
  
      const requestBody = {
        diagnosis: completionDetails.diagnosis,
        symptoms: completionDetails.symptoms.length > 0 ? completionDetails.symptoms : ['None'],
        treatment: {
          medications: completionDetails.treatment.medications.filter(med => med.name.trim() !== ''),
          recommendations: completionDetails.treatment.recommendations.length > 0 ? completionDetails.treatment.recommendations : ['None']
        },
        followUp: {
          required: completionDetails.followUp.required,
          notes: completionDetails.followUp.notes || 'No follow-up notes'
        }
      };
      
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(completeUrl, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const responseData = await response.json();
      console.log('Response status:', response.status);
      console.log('Response data:', responseData);

      if (response.ok) {
        // Close the dialog
        setShowCompleteDialog(false);
        
        // Refresh appointment data after completion
        const updatedResponse = await fetch(`${API_BASE_URL}/api/v1/appointments/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const updatedData = await updatedResponse.json();
        if (updatedData.status === 'success') {
          setAppointment(updatedData.data);
        }
      } else {
        console.error('Failed to complete appointment:', responseData);
      }
    } catch (error) {
      console.error('Error completing appointment:', error);
    }
  };

  const handleSymptomsChange = (value: string) => {
    const symptoms = value.split(',').map(s => s.trim()).filter(Boolean);
    console.log('Updated symptoms:', symptoms);
    setCompletionDetails(prev => ({
      ...prev,
      symptoms
    }));
  };

  const handleRecommendationsChange = (value: string) => {
    const recommendations = value.split(',').map(r => r.trim()).filter(Boolean);
    console.log('Updated recommendations:', recommendations);
    setCompletionDetails(prev => ({
      ...prev,
      treatment: {
        ...prev.treatment,
        recommendations
      }
    }));
  };

  const fetchMessages = async () => {
    try {
      setLoadingMessages(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/v1/appointments/${id}/messages`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.status === 'success') {
        setMessages(data.data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/v1/appointments/${id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newMessage.trim() })
      });

      if (response.ok) {
        setNewMessage('');
        fetchMessages(); // Refresh messages after sending
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/v1/message/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.status === 'success') {
        setUsers(data.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchMessages();
    }
  }, [id]);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Appointment Details</h1>
            <p className="text-gray-500 mt-1">Appointment ID: {id}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge 
              className={`px-3 py-1 rounded-md ${getStatusBadgeStyle(appointment?.status || '')}`}
            >
              {appointment?.status ? appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1) : 'Pending'}
            </Badge>
            <Button 
              variant="outline"
              className="text-gray-700"
              onClick={() => navigate('/appointments')}
            >
              Back to Appointments
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex border-b w-full">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex-1 px-6 py-4 text-sm font-medium ${
                activeTab === 'details'
                  ? 'border-b-2 border-gray-900 text-gray-900'
                  : 'text-gray-500'
              }`}
            >
              Appointment Details
            </button>
            <button
              onClick={() => setActiveTab('medical-report')}
              className={`flex-1 px-6 py-4 text-sm font-medium ${
                activeTab === 'medical-report'
                  ? 'border-b-2 border-gray-900 text-gray-900'
                  : 'text-gray-500'
              }`}
            >
              Medical Report
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`flex-1 px-6 py-4 text-sm font-medium ${
                activeTab === 'files'
                  ? 'border-b-2 border-gray-900 text-gray-900'
                  : 'text-gray-500'
              }`}
            >
              Files
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex-1 px-6 py-4 text-sm font-medium ${
                activeTab === 'messages'
                  ? 'border-b-2 border-gray-900 text-gray-900'
                  : 'text-gray-500'
              }`}
            >
              Messages
            </button>
          </div>

          {activeTab === 'details' && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-lg border p-6">
                    <h2 className="text-lg font-semibold mb-6 flex items-center">
                      <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                      Basic Information
                    </h2>
                    <div className="space-y-6">
                      <div className="flex items-start">
                        <CalendarIcon className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Appointment Date</p>
                          <p className="text-base font-medium mt-1">
                            Wednesday, June 25, 2025 at 03:00 AM
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <UserIcon className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Reason for Visit</p>
                          <p className="text-base font-medium mt-1">
                            Regular checkup and consultation
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <FileTextIcon className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Notes</p>
                          <p className="text-base mt-1">
                            Patient has been experiencing mild headaches over the past week
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="bg-white rounded-lg border p-6">
                    <h2 className="text-lg font-semibold mb-6 flex items-center">
                      <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                      Status & Timing
                    </h2>
                    <div className="space-y-6">
                      <div>
                        <p className="text-sm text-gray-500">Current Status</p>
                        <Badge 
                          className={`mt-2 px-3 py-1 rounded-md ${getStatusBadgeStyle(appointment?.status || '')}`}
                        >
                          {appointment?.status ? appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1) : 'Pending'}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Created Date</p>
                        <p className="text-base font-medium mt-1">
                          Saturday, May 24, 2025 at 03:07 AM
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Last Update</p>
                        <p className="text-base font-medium mt-1">
                          Saturday, May 24, 2025 at 03:07 AM
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'medical-report' && appointment?.appointmentReport && (
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Diagnosis</h3>
                  <p className="text-gray-700">{appointment.appointmentReport.diagnosis}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Symptoms</h3>
                  <div className="flex flex-wrap gap-2">
                    {appointment.appointmentReport.symptoms.map((symptom, index) => (
                      <Badge key={index} variant="secondary">{symptom}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Treatment</h3>
                  {appointment.appointmentReport.treatment.medications.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Medications</h4>
                      <div className="space-y-2">
                        {appointment.appointmentReport.treatment.medications.map((med, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-md">
                            <p className="font-medium">{med.name}</p>
                            <p className="text-sm text-gray-600">Dosage: {med.dosage}</p>
                            <p className="text-sm text-gray-600">Frequency: {med.frequency}</p>
                            <p className="text-sm text-gray-600">Duration: {med.duration}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {appointment.appointmentReport.treatment.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Recommendations</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {appointment.appointmentReport.treatment.recommendations.map((rec, index) => (
                          <li key={index} className="text-gray-700">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Follow-up</h3>
                  <p className="text-gray-700">
                    {appointment.appointmentReport.followUp.required ? 'Required' : 'Not Required'}
                  </p>
                  {appointment.appointmentReport.followUp.notes && (
                    <p className="text-gray-600 mt-1">{appointment.appointmentReport.followUp.notes}</p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Completion Details</h3>
                  <p className="text-gray-600">
                    Completed on: {new Date(appointment.appointmentReport.completedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'files' && (
            <div className="p-6">
              <p className="text-gray-500">Files content will be displayed here</p>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="p-6">
              <div className="flex h-[600px] gap-6">
                {/* Users Sidebar */}
                <div className="w-80 border rounded-lg flex flex-col">
                  <div className="p-4 border-b">
                    <div className="relative">
                      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  
                  <ScrollArea className="flex-1">
                    {loadingUsers ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {filteredUsers.map((user) => (
                          <button
                            key={user._id}
                            onClick={() => setSelectedUser(user._id)}
                            className={`w-full p-3 text-left hover:bg-gray-50 transition-colors ${
                              selectedUser === user._id ? 'bg-gray-50' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                {user.profileImage && (
                                  <AvatarImage src={user.profileImage} alt={user.name} />
                                )}
                                <AvatarFallback>
                                  {user.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium truncate">{user.name}</p>
                                  {user.lastMessage && (
                                    <span className="text-xs text-gray-500">
                                      {new Date(user.lastMessage.createdAt).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                                {user.lastMessage && (
                                  <p className="text-sm text-gray-500 truncate">
                                    {user.lastMessage.content}
                                  </p>
                                )}
                                <Badge variant="secondary" className="text-xs mt-1">
                                  {user.role}
                                </Badge>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>

                {/* Messages Area */}
                <div className="flex-1 border rounded-lg flex flex-col">
                  {selectedUser ? (
                    <>
                      <div className="p-4 border-b">
                        {users.find(u => u._id === selectedUser)?.name}
                      </div>
                      <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                          {messages.map((message) => (
                            <div
                              key={message._id}
                              className="flex items-start gap-3"
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {message.sender.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{message.sender.name}</span>
                                  <span className="text-sm text-gray-500">
                                    {new Date(message.createdAt).toLocaleString()}
                                  </span>
                                </div>
                                <p className="mt-1 text-gray-700">{message.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      <div className="p-4 border-t">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                              }
                            }}
                            className="flex-1"
                          />
                          <Button
                            onClick={sendMessage}
                            disabled={!newMessage.trim()}
                            className="bg-primary text-white"
                          >
                            <SendIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      Select a user to start messaging
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 space-y-2">
          {appointment?.status !== 'completed' && (
            <Button
              variant="outline"
              className="w-full mb-2 border-red-200 text-red-600 hover:bg-red-50 h-12 flex items-center justify-center"
              onClick={handleCancel}
            >
              <XIcon className="h-4 w-4 mr-2" />
              Cancel Appointment
            </Button>
          )}
          {appointment?.status !== 'completed' && (
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white h-12 flex items-center justify-center"
              onClick={() => setShowCompleteDialog(true)}
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              Complete Appointment
            </Button>
          )}
        </div>

        <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Complete Appointment</DialogTitle>
              <p className="text-sm text-gray-500">Enter the medical details for this appointment</p>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Diagnosis *</label>
                <Textarea 
                  placeholder="Enter patient diagnosis..."
                  value={completionDetails.diagnosis}
                  onChange={(e) => setCompletionDetails(prev => ({ ...prev, diagnosis: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Symptoms (comma separated)</label>
                <Input 
                  placeholder="e.g., Headache, Dizziness, Fatigue"
                  value={completionDetails.symptoms.join(', ')}
                  onChange={(e) => handleSymptomsChange(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium">Medications</label>
                {completionDetails.treatment.medications.map((med, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2">
                    <Input 
                      placeholder="Medication name"
                      value={med.name}
                      onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                    />
                    <Input 
                      placeholder="Dosage"
                      value={med.dosage}
                      onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                    />
                    <Input 
                      placeholder="Frequency"
                      value={med.frequency}
                      onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                    />
                    <Input 
                      placeholder="Duration"
                      value={med.duration}
                      onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddMedication}
                  className="mt-2"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Medication
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Recommendations (comma separated)</label>
                <Input 
                  placeholder="e.g., Rest well, Stay hydrated, Avoid bright lights"
                  value={completionDetails.treatment.recommendations.join(', ')}
                  onChange={(e) => handleRecommendationsChange(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="follow-up"
                    checked={completionDetails.followUp.required}
                    onCheckedChange={(checked) => 
                      setCompletionDetails(prev => ({ 
                        ...prev, 
                        followUp: { ...prev.followUp, required: checked as boolean }
                      }))
                    }
                  />
                  <label htmlFor="follow-up" className="text-sm font-medium">
                    Follow-up required
                  </label>
                </div>
                {completionDetails.followUp.required && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Follow-up Notes</label>
                    <Textarea 
                      placeholder="Enter follow-up notes..."
                      value={completionDetails.followUp.notes}
                      onChange={(e) => setCompletionDetails(prev => ({ 
                        ...prev, 
                        followUp: { ...prev.followUp, notes: e.target.value }
                      }))}
                    />
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700 text-white">
                Complete Appointment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AppointmentDetails; 