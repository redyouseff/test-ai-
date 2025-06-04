import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, User } from '../redux/types';
import { AppDispatch } from '../redux/store';
import DashboardLayout from '../components/layout/DashboardLayout';
import { mockDoctors, mockPatients, mockDiagnosticFiles } from '../data/mockData';
import { DoctorProfile, PatientProfile, DiagnosticFile } from '../types';
import DashboardStats from '@/components/dashboard/DashboardStats';
import UpcomingAppointments from '@/components/dashboard/UpcomingAppointments';
import ConnectedUsers from '@/components/dashboard/ConnectedUsers';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { fetchProfile } from '../redux/actions/authActions';
import api from '../redux/api';

interface Doctor {
  _id: string;
  fullName: string;
  email: string;
  profileImage?: string;
}

interface RecentFile {
  id: string;
  fileName: string;
  fileType: string;
  uploadDate: string;
}

interface Statistics {
  totalAppointments: number;
  upcomingAppointments: number;
  upcomingAppointmentsList: Array<{
    id: string;
    date: string;
    status: string;
    reasonForVisit: string;
    fullName: string;
    clinicLocation: string;
  }>;
  medicalRecordsCount: number;
  recentFiles: RecentFile[];
}

interface ExtendedUser {
  _id: string;
  id: string;
  name: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'patient' | 'doctor';
  doctors?: Doctor[];
  patients?: Array<{
    _id: string;
    fullName: string;
    email: string;
    profileImage?: string;
    medicalCondition?: string;
  }>;
  profileImage?: string;
  bloodType?: string;
  medications?: string[];
  chronicDiseases?: string[];
  medicalCondition?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const currentUser = user as unknown as ExtendedUser;
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<(DoctorProfile | PatientProfile)[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await api.get('/api/v1/users/statistics');
        setStatistics(response.data.data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    };

    if (currentUser) {
      fetchStatistics();
    }
  }, [currentUser]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: JSON.parse(storedUser),
          token: storedToken
        }
      });
      setLoading(false);
    } else {
      Promise.resolve(dispatch(fetchProfile())).finally(() => setLoading(false));
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>جاري التحميل...</p>
      </div>
    );
  }

  if (!currentUser) {
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
            Welcome, {currentUser.fullName}
          </h1>
          <p className="text-gray-600">
            {currentUser.role === 'patient' 
              ? 'Manage your appointments and health information.' 
              : 'Manage your patient appointments and consultations.'}
          </p>
        </div>

        {/* Overview Cards */}
        <DashboardStats 
          upcomingAppointmentsCount={statistics?.upcomingAppointments || 0}
          unreadMessagesCount={2}
          availableRecordsCount={statistics?.medicalRecordsCount || 0}
          userRole={currentUser.role}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Upcoming Appointments */}
            {statistics?.upcomingAppointmentsList && (
              <Card className="border-0 shadow-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0">
                  <CardTitle className="text-xl font-semibold">Upcoming Appointments</CardTitle>
                  <Button 
                    variant="ghost" 
                    className="text-primary hover:text-primary/90"
                    onClick={() => navigate('/appointments')}
                  >
                    View All
                  </Button>
                </CardHeader>
                <CardContent className="px-0">
                  <div className="space-y-3">
                    {statistics.upcomingAppointmentsList.map((appointment) => (
                      <div 
                        key={appointment.id}
                        className="flex items-center justify-between p-4 bg-white rounded-lg border hover:bg-gray-50/50 cursor-pointer"
                        onClick={() => navigate(`/appointment/${appointment.id}`)}
                      >
                        <div className="space-y-2">
                          <p className="text-primary font-medium">{appointment.reasonForVisit}</p>
                          <div className="space-y-1">
                            <p className="text-gray-900 font-medium">{appointment.fullName}</p>
                            <p className="text-gray-500 text-sm">{appointment.clinicLocation}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-900 font-medium mb-1">
                            {new Date(appointment.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </p>
                          <Badge 
                            variant={appointment.status === 'pending' ? 'secondary' : 'default'}
                            className={`${
                              appointment.status === 'pending' 
                                ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' 
                                : appointment.status === 'completed'
                                ? 'bg-purple-100 text-purple-800 hover:bg-purple-100'
                                : ''
                            }`}
                          >
                            {appointment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Connected Doctors/Patients */}
            <div className="mt-6">
              {currentUser.role === 'patient' ? (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-md font-medium">Your Doctors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {currentUser.doctors && currentUser.doctors.length > 0 ? (
                        currentUser.doctors.map((doctor) => (
                          <div 
                            key={doctor._id}
                            className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                            onClick={() => navigate(`/doctor/${doctor._id}`)}
                          >
                            <div className="flex-shrink-0">
                              {doctor.profileImage ? (
                                <img 
                                  src={doctor.profileImage} 
                                  alt={doctor.fullName}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-primary text-lg font-semibold">
                                    {doctor.fullName.charAt(0)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {doctor.fullName}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {doctor.email}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-gray-500">No doctors assigned yet</p>
                          <Button 
                            variant="outline"
                            className="mt-2"
                            onClick={() => navigate('/find-doctor')}
                          >
                            Find a Doctor
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <ConnectedUsers 
                  users={connectedUsers} 
                  currentUserRole={currentUser.role} 
                />
              )}
            </div>

            {/* Recent Files */}
            {currentUser.role === 'patient' && statistics?.recentFiles.length > 0 && (
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
                    {statistics.recentFiles.slice(0, 3).map((file) => (
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
                          {file.fileType ? file.fileType.split('/')[0] : 'Unknown'}
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
            {currentUser.role === 'patient' && (
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
                        {(currentUser as PatientProfile).bloodType || 'Not recorded'}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Medications</h3>
                      {(currentUser as PatientProfile).medications && 
                       (currentUser as PatientProfile).medications!.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {(currentUser as PatientProfile).medications!.map((med, index) => (
                            <Badge key={index} variant="outline">{med}</Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600">No medications recorded</p>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Chronic Diseases</h3>
                      {(currentUser as PatientProfile).chronicDiseases && 
                       (currentUser as PatientProfile).chronicDiseases!.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {(currentUser as PatientProfile).chronicDiseases!.map((disease, index) => (
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
            {currentUser.role === 'doctor' && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Patients</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {currentUser.patients && currentUser.patients.length > 0 ? (
                      currentUser.patients.map((patient) => (
                        <div 
                          key={patient._id} 
                          className="flex items-center justify-between p-3 hover:bg-gray-50 rounded cursor-pointer"
                          onClick={() => navigate(`/patient/${patient._id}`)}
                        >
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                              {patient.profileImage ? (
                                <img 
                                  src={patient.profileImage}
                                  alt={patient.fullName}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <span className="font-medium text-gray-700">
                                  {patient.fullName.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{patient.fullName}</p>
                              <p className="text-xs text-gray-500">
                                {patient.medicalCondition || 'No medical condition recorded'}
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/patient/${patient._id}`);
                            }}
                          >
                            View Details
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-gray-500">You have no patients yet.</p>
                      </div>
                    )}
                  </div>
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
