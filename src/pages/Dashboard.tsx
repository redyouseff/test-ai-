import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/types';
import DashboardLayout from '../components/layout/DashboardLayout';
import { mockAppointments, mockDoctors, mockPatients, mockDiagnosticFiles } from '../data/mockData';
import { Appointment, DoctorProfile, PatientProfile, DiagnosticFile } from '../types';
import DashboardStats from '@/components/dashboard/DashboardStats';
import UpcomingAppointments from '@/components/dashboard/UpcomingAppointments';
import ConnectedUsers from '@/components/dashboard/ConnectedUsers';
import AIChatAssistant from '@/components/chat/AIChatAssistant';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { fetchProfile } from '../redux/actions/authActions';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [connectedUsers, setConnectedUsers] = useState<(DoctorProfile | PatientProfile)[]>([]);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [patientFiles, setPatientFiles] = useState<DiagnosticFile[]>([]);
  const dispatch = useDispatch();
 console.log(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) return;

    // Filter appointments based on user role
    const userAppointments = mockAppointments.filter((appointment) => {
      if (user.role === 'patient') {
        return appointment.patientId === user.id;
      } else if (user.role === 'doctor') {
        return appointment.doctorId === user.id;
      }
      return false;
    });

    // Filter upcoming and past appointments
    const now = new Date();
    const upcoming = userAppointments
      .filter((appointment) => new Date(appointment.date) > now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
    
    const recent = userAppointments
      .filter((appointment) => new Date(appointment.date) <= now)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);

    setUpcomingAppointments(upcoming);
    setRecentAppointments(recent);

    // Get connected users (doctors or patients)
    if (user.role === 'patient') {
      const patientDoctors = mockDoctors.filter((doctor) => {
        return userAppointments.some((appt) => appt.doctorId === doctor.id);
      });
      setConnectedUsers(patientDoctors);
      
      // Get patient files
      const files = mockDiagnosticFiles.filter(file => file.patientId === user.id);
      setPatientFiles(files);
    } else if (user.role === 'doctor') {
      const doctorPatients = mockPatients.filter((patient) => {
        return userAppointments.some((appt) => appt.patientId === patient.id);
      });
      setConnectedUsers(doctorPatients);
    }

    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    dispatch(fetchProfile() as any);
  }, [dispatch]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Get doctor name from doctor ID
  const getDoctorName = (doctorId: string) => {
    const doctor = mockDoctors.find((d) => d.id === doctorId);
    return doctor ? doctor.name : 'Unknown Doctor';
  };

  // Get patient name from patient ID
  const getPatientName = (patientId: string) => {
    const patient = mockPatients.find((p) => p.id === patientId);
    return patient ? patient.name : 'Unknown Patient';
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please login to view your dashboard.</p>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user.name}
          </h1>
          <p className="text-gray-600">
            {user.role === 'patient' 
              ? 'Manage your appointments and health information.' 
              : 'Manage your patient appointments and consultations.'}
          </p>
        </div>

        {/* Overview Cards */}
        <DashboardStats 
          upcomingAppointmentsCount={upcomingAppointments.length}
          unreadMessagesCount={2}
          availableRecordsCount={user.role === 'patient' ? 3 : 8}
          userRole={user.role as 'patient' | 'doctor'}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Upcoming Appointments */}
            <UpcomingAppointments
              appointments={upcomingAppointments}
              userRole={user.role as 'patient' | 'doctor'}
              getDoctorName={getDoctorName}
              getPatientName={getPatientName}
              formatDate={formatDate}
            />

            {/* Connected Doctors/Patients */}
            <div className="mt-6">
              <ConnectedUsers 
                users={connectedUsers} 
                currentUserRole={user.role as 'patient' | 'doctor'} 
              />
            </div>

            {/* Recent Files */}
            {user.role === 'patient' && patientFiles.length > 0 && (
              <Card className="mt-6">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-md font-medium">Recent Files</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-sm font-medium"
                    onClick={() => navigate('/medical-records')}
                  >
                    View All Files
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {patientFiles.slice(0, 3).map((file) => (
                      <div 
                        key={file.id} 
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                      >
                        <div className="flex items-center">
                          <FileText className="h-9 w-9 p-2 rounded bg-gray-100 text-gray-700 mr-3" />
                          <div>
                            <p className="text-sm font-medium">{file.fileName}</p>
                            <p className="text-xs text-gray-500">{formatDate(file.uploadDate)}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {file.fileType.split('/')[0]}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            {/* Patient Medical Summary */}
            {user.role === 'patient' && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Medical Summary</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-sm font-medium"
                      onClick={() => navigate('/medical-records')}
                    >
                      View Records
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Blood Type</h3>
                      <p className="text-lg font-semibold">
                        {(user as PatientProfile).bloodType || 'Not recorded'}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Medications</h3>
                      {(user as PatientProfile).medications && 
                       (user as PatientProfile).medications!.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {(user as PatientProfile).medications!.map((med, index) => (
                            <Badge key={index} variant="outline">{med}</Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600">No medications recorded</p>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Chronic Diseases</h3>
                      {(user as PatientProfile).chronicDiseases && 
                       (user as PatientProfile).chronicDiseases!.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {(user as PatientProfile).chronicDiseases!.map((disease, index) => (
                            <Badge key={index} variant="secondary">{disease}</Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600">None reported</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Patient list for doctors */}
            {user.role === 'doctor' && connectedUsers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Patients</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {connectedUsers.slice(0, 5).map((patient) => (
                      <div 
                        key={patient.id} 
                        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded cursor-pointer"
                        onClick={() => navigate(`/patient-files/${patient.id}`)}
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                            <span className="font-medium text-gray-700">
                              {patient.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{patient.name}</p>
                            <p className="text-xs text-gray-500">
                              {(patient as PatientProfile).medicalCondition || 'No conditions noted'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Assistant for doctors only */}
            {user.role === 'doctor' && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>AI Assistant</CardTitle>
                </CardHeader>
                <CardContent>
                  {showAIAssistant ? (
                    <div className="h-[400px]">
                      <AIChatAssistant />
                    </div>
                  ) : (
                    <div className="text-center py-8 space-y-4">
                      <p>
                        Get help with patient summaries, appointment scheduling, and message drafting.
                      </p>
                      <button
                        onClick={() => setShowAIAssistant(true)}
                        className="inline-flex items-center px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                      >
                        Chat with AI Assistant
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
