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
import { FileText, User as UserIcon, Star, StarHalf, Download, File, FileImage, Trash2, Calendar } from 'lucide-react';
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

  // Add helper function to get file icon
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="w-10 h-10 text-red-500" />;
      case 'doc':
      case 'docx':
        return <File className="w-10 h-10 text-blue-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <FileImage className="w-10 h-10 text-green-500" />;
      default:
        return <FileText className="w-10 h-10 text-gray-400" />;
    }
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
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-8 border shadow-sm">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-white shadow-md flex items-center justify-center border-4 border-white">
              {currentUser.profileImage ? (
                <img 
                  src={currentUser.profileImage} 
                  alt={currentUser.fullName}
                  className="w-full h-full rounded-full object-cover" 
                />
              ) : (
                <span className="text-3xl font-bold text-primary">
                  {currentUser.fullName.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {currentUser.fullName}
              </h1>
              <p className="text-gray-600 text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                {currentUser.role === 'patient' 
                  ? 'Manage your appointments and health information' 
                  : 'Manage your patient appointments and consultations'}
              </p>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <DashboardStats 
          upcomingAppointmentsCount={statistics?.upcomingAppointments || 0}
          unreadMessagesCount={2}
          availableRecordsCount={statistics?.medicalRecordsCount || 0}
          userRole={currentUser.role}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Appointments */}
            {statistics?.upcomingAppointmentsList && (
              <Card className="border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-xl font-semibold">Upcoming Appointments</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">Your scheduled appointments</p>
                  </div>
                  <Button 
                    variant="outline"
                    className="text-primary border-primary hover:bg-primary hover:text-white"
                    onClick={() => navigate('/appointments')}
                  >
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {statistics.upcomingAppointmentsList.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No upcoming appointments</p>
                      </div>
                    ) : (
                      statistics.upcomingAppointmentsList.map((appointment) => (
                        <div 
                          key={appointment.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                          onClick={() => navigate(`/appointment/${appointment.id}`)}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                {appointment.status}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {new Date(appointment.date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                            <p className="font-medium text-gray-900">{appointment.reasonForVisit}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>{appointment.fullName}</span>
                              <span>•</span>
                              <span>{appointment.clinicLocation}</span>
                            </div>
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            {new Date(appointment.date).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-6">
            {/* Connected Users Section */}
            {currentUser.role === 'doctor' ? (
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Your Patients</CardTitle>
                  <p className="text-sm text-gray-500">List of patients under your care</p>
                </CardHeader>
                <CardContent>
                  {currentUser.patients && currentUser.patients.length > 0 ? (
                    <div className="space-y-4">
                      {currentUser.patients.map((patient) => (
                        <div 
                          key={patient._id}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => navigate(`/patient/${patient._id}`)}
                        >
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            {patient.profileImage ? (
                              <img 
                                src={patient.profileImage} 
                                alt={patient.fullName}
                                className="w-full h-full rounded-full object-cover" 
                              />
                            ) : (
                              <span className="text-sm font-medium text-primary">
                                {patient.fullName.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{patient.fullName}</p>
                            <p className="text-sm text-gray-500">{patient.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No patients yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Your Doctors</CardTitle>
                  <p className="text-sm text-gray-500">Healthcare providers managing your care</p>
                </CardHeader>
                <CardContent>
                  {currentUser.doctors && currentUser.doctors.length > 0 ? (
                    <div className="space-y-4">
                      {currentUser.doctors.map((doctor) => (
                        <div 
                          key={doctor._id}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => navigate(`/doctor/${doctor._id}`)}
                        >
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            {doctor.profileImage ? (
                              <img 
                                src={doctor.profileImage} 
                                alt={doctor.fullName}
                                className="w-full h-full rounded-full object-cover" 
                              />
                            ) : (
                              <span className="text-sm font-medium text-primary">
                                {doctor.fullName.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{doctor.fullName}</p>
                            <p className="text-sm text-gray-500">{doctor.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No doctors assigned yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Your Files Section */}
            {statistics?.recentFiles && (
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Your Files</CardTitle>
                  <p className="text-sm text-gray-500">Recently uploaded documents</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {statistics.recentFiles.length === 0 ? (
                      <div className="text-center py-6">
                        <FileText className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No files available</p>
                      </div>
                    ) : (
                      statistics.recentFiles.map((file) => (
                        <div 
                          key={file.id}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            {getFileIcon(file.fileName)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{file.fileName}</p>
                          </div>
                        </div>
                      ))
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
