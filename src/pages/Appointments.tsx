import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/types';
import DashboardLayout from '../components/layout/DashboardLayout';
import { mockAppointments, mockDoctors, mockPatients } from '../data/mockData';
import { Appointment } from '../types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, MessageSquare } from 'lucide-react';

const Appointments = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (!currentUser) return;

    // Filter appointments based on user role
    const userAppointments = mockAppointments.filter((appointment) => {
      if (currentUser.role === 'patient') {
        return appointment.patientId === currentUser.id;
      } else if (currentUser.role === 'doctor') {
        return appointment.doctorId === currentUser.id;
      }
      return false;
    });

    // Filter upcoming and past appointments
    const now = new Date();
    const upcoming = userAppointments
      .filter((appointment) => new Date(appointment.date) > now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const past = userAppointments
      .filter((appointment) => new Date(appointment.date) <= now)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setUpcomingAppointments(upcoming);
    setPastAppointments(past);
  }, [currentUser]);

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

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="mt-6">
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div 
                    key={appointment.id} 
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
                              ? `Appointment with Dr. ${getDoctorName(appointment.doctorId)}` 
                              : `Appointment with ${getPatientName(appointment.patientId)}`}
                          </h3>
                          <p className="text-gray-500 capitalize">
                            {appointment.specialty.replace('-', ' ')} Consultation
                          </p>
                          <p className="text-gray-600 mt-2">{appointment.notes}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 md:mt-0 flex flex-col items-end">
                        <p className="text-primary font-medium">
                          {formatDate(appointment.date)}
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
                          <Button 
                            size="sm" 
                            className="bg-primary hover:bg-primary-dark text-white flex items-center"
                            onClick={() => navigate(`/appointments/${appointment.id}`)}
                          >
                            <FileText size={14} className="mr-1" /> Details
                          </Button>
                        </div>
                      </div>
                    </div>

                    {appointment.requiredFiles && appointment.requiredFiles.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm font-medium text-gray-700">Required Files:</p>
                        <ul className="mt-2 text-sm text-gray-600">
                          {appointment.requiredFiles.map((file, index) => (
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
            {pastAppointments.length > 0 ? (
              <div className="space-y-4">
                {pastAppointments.map((appointment) => (
                  <div 
                    key={appointment.id} 
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
                              ? `Appointment with Dr. ${getDoctorName(appointment.doctorId)}` 
                              : `Appointment with ${getPatientName(appointment.patientId)}`}
                          </h3>
                          <p className="text-gray-500 capitalize">
                            {appointment.specialty.replace('-', ' ')} Consultation
                          </p>
                          <p className="text-gray-600 mt-2">{appointment.notes}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 md:mt-0 flex flex-col items-end">
                        <p className="text-gray-500">
                          {formatDate(appointment.date)}
                        </p>
                        <span className="mt-2 px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          Completed
                        </span>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2"
                          onClick={() => navigate(`/appointments/${appointment.id}`)}
                        >
                          View Summary
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText size={40} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-700">No Past Appointments</h3>
                <p className="text-gray-500 max-w-md mx-auto mt-2">
                  You don't have any past appointment records.
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
