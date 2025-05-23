
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from 'lucide-react';
import { Appointment } from '@/types';

interface UpcomingAppointmentsProps {
  appointments: Appointment[];
  userRole: 'patient' | 'doctor';
  getDoctorName: (doctorId: string) => string;
  getPatientName: (patientId: string) => string;
  formatDate: (dateString: string) => string;
}

export default function UpcomingAppointments({
  appointments,
  userRole,
  getDoctorName,
  getPatientName,
  formatDate
}: UpcomingAppointmentsProps) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        {appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div 
                key={appointment.id} 
                className="flex flex-col md:flex-row justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/appointments/${appointment.id}`)}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
                    <Calendar size={18} className="text-primary-dark" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {userRole === 'patient' 
                        ? `Dr. ${getDoctorName(appointment.doctorId)}` 
                        : getPatientName(appointment.patientId)}
                    </h3>
                    <p className="text-sm text-gray-600">{appointment.notes}</p>
                  </div>
                </div>
                <div className="mt-2 md:mt-0 text-right">
                  <p className="text-sm text-primary font-medium">
                    {formatDate(appointment.date)}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {appointment.specialty.replace('-', ' ')} consultation
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No upcoming appointments.</p>
            {userRole === 'patient' && (
              <Button 
                className="mt-4 bg-primary hover:bg-primary-dark text-white"
                onClick={() => navigate('/specialties')}
              >
                Book an Appointment
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
