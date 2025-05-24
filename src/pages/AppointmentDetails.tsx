import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/types';
import Layout from '../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, User, FileText, CalendarDays, X } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { format } from 'date-fns';
import axios from 'axios';
import { Badge } from '@/components/ui/badge';

interface Doctor {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  specialty: {
    _id: string;
    name: string;
  };
  clinicLocation: string;
  profileImage?: string;
}

interface Appointment {
  _id: string;
  doctor: Doctor;
  appointmentDate: string;
  reasonForVisit: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}

const AppointmentDetails = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!appointmentId) return;

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `https://care-insight-api-9ed25d3ea3ea.herokuapp.com/api/v1/appointments/${appointmentId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.status === 'success') {
          setAppointment(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching appointment:', error);
        toast({
          title: "Error",
          description: "Failed to load appointment details. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId, toast]);

  const handleCancelAppointment = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `https://care-insight-api-9ed25d3ea3ea.herokuapp.com/api/v1/appointments/${appointmentId}/cancel`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 'success') {
        toast({
          title: "Success",
          description: "Appointment cancelled successfully.",
        });
        navigate('/appointments');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast({
        title: "Error",
        description: "Failed to cancel appointment. Please try again later.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!appointment) {
    return (
      <Layout>
        <div className="container mx-auto py-12 px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Appointment Not Found</h1>
          <p className="mb-8">The appointment you are looking for does not exist.</p>
          <Button 
            className="bg-primary hover:bg-primary-dark text-white"
            onClick={() => navigate('/appointments')}
          >
            Back to Appointments
          </Button>
        </div>
      </Layout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Appointment Details</h1>
            <Button
              variant="outline"
              onClick={() => navigate('/appointments')}
            >
              Back to Appointments
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Status Badge */}
                <div className="flex justify-between items-center">
                  <Badge className={`${getStatusColor(appointment.status)} capitalize px-3 py-1`}>
                    {appointment.status}
                  </Badge>
                  {appointment.status === 'pending' && (
                    <Button
                      variant="destructive"
                      onClick={handleCancelAppointment}
                      className="flex items-center"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel Appointment
                    </Button>
                  )}
                </div>

                {/* Doctor Info */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {appointment.doctor.profileImage ? (
                      <img
                        src={appointment.doctor.profileImage}
                        alt={appointment.doctor.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-primary" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{appointment.doctor.fullName}</h2>
                    <p className="text-gray-600">{appointment.doctor.specialty.name}</p>
                    <div className="flex items-center gap-2 mt-2 text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span>{appointment.doctor.clinicLocation}</span>
                    </div>
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Appointment Date</p>
                      <p className="text-gray-600">
                        {format(new Date(appointment.appointmentDate), 'MMMM dd, yyyy')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Reason for Visit</p>
                      <p className="text-gray-600">{appointment.reasonForVisit}</p>
                    </div>
                  </div>

                  {appointment.notes && (
                    <div className="flex items-start gap-2">
                      <FileText className="w-5 h-5 text-primary mt-1" />
                      <div>
                        <p className="font-medium">Additional Notes</p>
                        <p className="text-gray-600">{appointment.notes}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Booking Date</p>
                      <p className="text-gray-600">
                        {format(new Date(appointment.createdAt), 'MMMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="border-t pt-4 mt-6">
                  <h3 className="font-semibold mb-3">Contact Information</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-gray-600">Email:</span>{' '}
                      {appointment.doctor.email}
                    </p>
                    <p>
                      <span className="text-gray-600">Phone:</span>{' '}
                      {appointment.doctor.phoneNumber}
                    </p>
                    <p>
                      <span className="text-gray-600">Location:</span>{' '}
                      {appointment.doctor.clinicLocation}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AppointmentDetails; 