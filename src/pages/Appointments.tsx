import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/types';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Appointment, AppointmentApiResponse } from '../types/appointments';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar } from 'lucide-react';
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

      const response = await axios.get<AppointmentApiResponse>(
        `https://care-insight-api-9ed25d3ea3ea.herokuapp.com/api/v1/appointments?type=${type}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.status === 'success') {
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

  const renderAppointmentCard = (appointment: Appointment, isPast: boolean = false) => (
    <div 
      key={appointment._id} 
      className={`bg-white p-6 rounded-lg shadow-sm ${isPast ? '' : 'hover:shadow-md'} transition-shadow border border-gray-100 cursor-pointer`}
      onClick={() => navigate(`/appointment/${appointment._id}`)}
    >
      <div className="flex flex-col md:flex-row justify-between">
        <div className="flex items-start space-x-4">
          <div className={`w-12 h-12 rounded-full ${isPast ? 'bg-gray-100' : 'bg-primary-light'} flex items-center justify-center`}>
            <Calendar size={20} className={isPast ? 'text-gray-500' : 'text-primary-dark'} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">
              {currentUser?.role === 'patient' 
                ? `Appointment with Dr. ${appointment.doctor.fullName}` 
                : `Appointment with ${appointment.patient.fullName}`}
            </h3>
            <p className="text-gray-500">
              {appointment.reasonForVisit}
            </p>
            <p className="text-gray-600 mt-2">{appointment.notes}</p>
          </div>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col items-end">
          <p className={isPast ? 'text-gray-500' : 'text-primary font-medium'}>
            {formatDate(appointment.appointmentDate)}
          </p>
        </div>
      </div>
    </div>
  );

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
                {upcomingAppointments.map((appointment) => renderAppointmentCard(appointment))}
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
                {pastAppointments.map((appointment) => renderAppointmentCard(appointment, true))}
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