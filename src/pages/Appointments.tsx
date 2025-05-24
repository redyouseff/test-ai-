import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/types';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Appointment } from '../types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, MessageSquare } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const Appointments = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');

  const fetchAppointments = async (type: 'upcoming' | 'past') => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(
        `https://care-insight-api-9ed25d3ea3ea.herokuapp.com/api/v1/appointments?type=${type}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        if (type === 'upcoming') {
          setUpcomingAppointments(response.data.data.appointments);
        } else {
          setPastAppointments(response.data.data.appointments);
        }
      }
    } catch (error) {
      let errorMessage = "Failed to fetch appointments.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    fetchAppointments(activeTab as 'upcoming' | 'past');
  }, [currentUser, activeTab]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'EEE, MMM d, yyyy h:mm a');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Appointments</h1>
          {currentUser?.role === 'patient' && (
            <Button 
              className="bg-primary hover:bg-primary-dark text-white"
              onClick={() => navigate('/specialties')}
            >
              Book New Appointment
            </Button>
          )}
        </div>

        <Tabs defaultValue="upcoming" className="w-full" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="mt-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div 
                    key={appointment._id} 
                    className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                  >
                    <div className="flex flex-col md:flex-row justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center">
                          <Calendar size={20} className="text-primary-dark" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {currentUser?.role === 'patient' 
                              ? `Appointment with Dr. ${appointment.doctor?.fullName || appointment.doctor?.name}` 
                              : `Appointment with ${appointment.patient?.fullName || appointment.patient?.name}`}
                          </h3>
                          <p className="text-gray-500">
                            {appointment.reasonForVisit}
                          </p>
                          <p className="text-gray-600 mt-2">{appointment.notes}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 md:mt-0 flex flex-col items-end">
                        <p className="text-primary font-medium">
                          {formatDate(appointment.appointmentDate)}
                        </p>
                        <div className="flex space-x-2 mt-4">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex items-center"
                            onClick={() => navigate(`/messages`)}
                          >
                            <MessageSquare size={14} className="mr-1" /> Message
                          </Button>
                        </div>
                      </div>
                    </div>

                    {appointment.uploadedFiles && appointment.uploadedFiles.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm font-medium text-gray-700">Uploaded Files:</p>
                        <ul className="mt-2 text-sm text-gray-600">
                          {appointment.uploadedFiles.map((file, index) => (
                            <li key={index} className="flex items-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary-light mr-2"></span>
                              {file}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar size={40} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-700">No Upcoming Appointments</h3>
                <p className="text-gray-500 max-w-md mx-auto mt-2">
                  {currentUser?.role === 'patient' 
                    ? "You don't have any upcoming appointments scheduled. Would you like to book one?" 
                    : "You don't have any upcoming appointments with patients."}
                </p>
                {currentUser?.role === 'patient' && (
                  <Button 
                    className="mt-6 bg-primary hover:bg-primary-dark text-white"
                    onClick={() => navigate('/specialties')}
                  >
                    Book an Appointment
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="past" className="mt-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : pastAppointments.length > 0 ? (
              <div className="space-y-4">
                {pastAppointments.map((appointment) => (
                  <div 
                    key={appointment._id} 
                    className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
                  >
                    <div className="flex flex-col md:flex-row justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <Calendar size={20} className="text-gray-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {currentUser?.role === 'patient' 
                              ? `Appointment with Dr. ${appointment.doctor?.fullName || appointment.doctor?.name}` 
                              : `Appointment with ${appointment.patient?.fullName || appointment.patient?.name}`}
                          </h3>
                          <p className="text-gray-500">
                            {appointment.reasonForVisit}
                          </p>
                          <p className="text-gray-600 mt-2">{appointment.notes}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 md:mt-0 text-right">
                        <p className="text-gray-500">
                          {formatDate(appointment.appointmentDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar size={40} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-700">No Past Appointments</h3>
                <p className="text-gray-500 max-w-md mx-auto mt-2">
                  You don't have any past appointments to display.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Appointments;
