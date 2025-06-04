import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/types';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, UserIcon, FileTextIcon, XIcon, CheckIcon, PlusIcon, Loader2 } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

interface AppointmentDetails {
  _id: string;
  appointmentDate: string;
  status: string;
  reasonForVisit: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  uploadedFiles: Array<{
    fileName: string;
    fileUrl: string;
    fileType: string;
    uploadDate: string;
    _id: string;
  }>;
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

interface User {
  _id: string;
  name: string;
  role: string;
  profileImage?: string;
}

const API_BASE_URL = 'https://care-insight-api-9ed25d3ea3ea.herokuapp.com';

const getStatusBadgeStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'cancelled':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'confirmed':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const AppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDoctor, setIsDoctor] = useState(false);
  
  // Get user data from Redux store
  const { user } = useSelector((state: RootState) => state.auth);

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

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setIsDoctor(user.role === 'doctor');
        console.log('User role:', user.role);
        console.log('Is doctor:', user.role === 'doctor');
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    // Fetch appointment details
    const fetchAppointmentDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/v1/appointments/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();
        if (result.status === 'success' && result.data && result.data.appointment) {
          setAppointment(result.data.appointment);
          console.log('Appointment status:', result.data.appointment.status);
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
      setIsCancelling(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/v1/appointments/${id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast({
          title: "Success",
          variant: "default",
        });
        navigate('/appointments');
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error canceling appointment:', error);
      toast({
        title: "Error",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
      setShowCancelDialog(false);
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
      
      const response = await fetch(completeUrl, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        // Close the dialog
        setShowCompleteDialog(false);
        
        // Show success toast
        toast({
          title: "Success",
          description: "Appointment has been completed successfully!",
          variant: "default",
        });

        // Refresh the page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to complete appointment",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error completing appointment:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
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

        <div className="bg-white rounded-lg shadow-sm mb-6">
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
              {appointment?.uploadedFiles && Array.isArray(appointment.uploadedFiles) && appointment.uploadedFiles.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Uploaded Files ({appointment.uploadedFiles.length})</h3>
                  <div className="grid gap-4">
                    {appointment.uploadedFiles.map((file) => (
                      <div 
                        key={file._id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                            {file.fileType === "image/png" || file.fileType === "image/jpeg" || file.fileType === "image/jpg" ? (
                              <img 
                                src={file.fileUrl} 
                                alt={file.fileName.split('/').pop() || 'Preview'} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '';
                                  target.classList.add('bg-gray-100');
                                }}
                              />
                            ) : (
                              <FileTextIcon className="h-5 w-5 text-gray-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {file.fileName.split('/').pop()}
                            </p>
                            <p className="text-sm text-gray-500">
                              Uploaded on {new Date(file.uploadDate).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <a
                          href={file.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                          View File
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700">No Files Uploaded</h3>
                  <p className="text-gray-500 mt-2">
                    There are no files uploaded for this appointment.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Debug info */}
        <div className="hidden">
          <p>Is Doctor: {String(isDoctor)}</p>
          <p>Appointment Status: {appointment?.status}</p>
          <p>Should Show Buttons: {String(isDoctor && appointment?.status === 'pending')}</p>
        </div>

        {/* Doctor Actions */}
        {isDoctor && appointment?.status === 'pending' && (
          <div className="space-y-3 px-8">
            <Button
              variant="outline"
              className="w-full h-12 border border-red-200 text-red-600 hover:bg-red-50 flex items-center justify-center"
              onClick={() => setShowCancelDialog(true)}
            >
              <XIcon className="h-4 w-4 mr-2" />
              Cancel Appointment
            </Button>
            <Button
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center"
              onClick={() => setShowCompleteDialog(true)}
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              Complete Appointment
            </Button>
          </div>
        )}

        {/* Cancel Confirmation Dialog */}
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Appointment</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel this appointment? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(false)}
                disabled={isCancelling}
              >
                No, Keep Appointment
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Yes, Cancel Appointment'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
              <Button 
                onClick={handleComplete} 
                className="bg-green-600 hover:bg-green-700 text-white"
              >
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