
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Layout from '../components/layout/Layout';
import { mockDoctors } from '../data/mockData';
import { DoctorProfile } from '../types';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock } from 'lucide-react';

const BookAppointment = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [reason, setReason] = useState<string>("");

  useEffect(() => {
    if (!doctorId) return;

    const foundDoctor = mockDoctors.find(doc => doc.id === doctorId);
    if (foundDoctor) {
      setDoctor(foundDoctor);
    }
  }, [doctorId]);

  // Generate available times when a date is selected
  useEffect(() => {
    if (selectedDate && doctor) {
      // Get day of week
      const dayOfWeek = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' });
      
      // Check if doctor is available on this day
      if (doctor.availableDays?.includes(dayOfWeek)) {
        // Find available hours for this day
        const daySchedule = doctor.availableHours?.find(schedule => schedule.day === dayOfWeek);
        
        if (daySchedule && daySchedule.hours.length > 0) {
          // Generate time slots based on doctor's available hours
          const times: string[] = [];
          
          daySchedule.hours.forEach(hourRange => {
            const [startHour, startMinute] = hourRange.start.split(':').map(Number);
            const [endHour, endMinute] = hourRange.end.split(':').map(Number);
            
            // Generate 30-minute slots
            let currentHour = startHour;
            let currentMinute = startMinute;
            
            while (
              currentHour < endHour || 
              (currentHour === endHour && currentMinute < endMinute)
            ) {
              times.push(`${currentHour}:${currentMinute === 0 ? '00' : currentMinute}`);
              
              // Advance by 30 minutes
              currentMinute += 30;
              if (currentMinute >= 60) {
                currentHour += 1;
                currentMinute = 0;
              }
            }
          });
          
          setAvailableTimes(times);
        } else {
          setAvailableTimes([]);
          toast({
            title: "No Hours Available",
            description: `Dr. ${doctor.name} does not have specific hours set for ${dayOfWeek}. Please select another day.`,
          });
        }
      } else {
        setAvailableTimes([]);
        toast({
          title: "Doctor Not Available",
          description: `Dr. ${doctor.name} is not available on ${dayOfWeek}s. Please select another day.`,
        });
      }
    } else {
      setAvailableTimes([]);
    }
  }, [selectedDate, doctor, toast]);

  const handleBookAppointment = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (!selectedDate || !selectedTime || !reason) {
      toast({
        title: "Incomplete Information",
        description: "Please select a date, time, and reason for your appointment.",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would create an appointment in the database
    toast({
      title: "Appointment Booked Successfully",
      description: `Your appointment with Dr. ${doctor?.name} has been scheduled for ${selectedDate.toLocaleDateString()} at ${formatTime(selectedTime)}.`,
    });
    
    navigate('/dashboard');
  };

  // Format time for display
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    return `${hour > 12 ? hour - 12 : hour}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  if (!doctor) {
    return (
      <Layout>
        <div className="container mx-auto py-12 px-4 text-center">
          <p>Doctor not found.</p>
          <Button 
            className="mt-4 bg-primary hover:bg-primary-dark text-white"
            onClick={() => navigate('/specialties')}
          >
            Return to Specialties
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold mb-6">Book an Appointment with {doctor.name}</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Doctor Information */}
          <Card className="lg:col-span-1">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-24 h-24 rounded-full bg-primary-light flex items-center justify-center mb-4">
                  {doctor.profileImage ? (
                    <img 
                      src={doctor.profileImage} 
                      alt={doctor.name} 
                      className="w-full h-full rounded-full object-cover" 
                    />
                  ) : (
                    <span className="text-primary-dark font-bold text-3xl">
                      {doctor.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold">{doctor.name}</h2>
                <p className="text-gray-600 mt-1 capitalize">{doctor.specialty.replace('-', ' ')}</p>
                <p className="text-sm text-gray-500 mt-2">{doctor.workPlace}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">About Doctor</h3>
                  <p className="text-sm text-gray-600">{doctor.bio}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-1">Available Days</h3>
                  <div className="flex flex-wrap gap-2">
                    {doctor.availableDays?.map((day, index) => (
                      <Badge 
                        key={index} 
                        className="text-xs px-3 py-1 bg-primary-light text-primary-dark"
                      >
                        {day}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Weekly Schedule</h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">Day</TableHead>
                          <TableHead>Hours</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {doctor.availableHours?.map((schedule) => (
                          <TableRow key={schedule.day}>
                            <TableCell className="font-medium">{schedule.day}</TableCell>
                            <TableCell>
                              {schedule.hours.map((hour, idx) => (
                                <div key={idx} className="flex items-center text-sm mb-1 last:mb-0">
                                  <Clock className="h-3 w-3 mr-1 text-gray-400" />
                                  {hour.start} - {hour.end}
                                </div>
                              ))}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-1">Certifications</h3>
                  <ul className="text-sm text-gray-600 list-disc pl-5">
                    {doctor.certifications.map((cert, index) => (
                      <li key={index}>{cert}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appointment Booking */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-6">Select Date & Time</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Calendar */}
                  <div>
                    <h3 className="font-medium mb-3">Select Date</h3>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="border rounded-md"
                      disabled={(date) => {
                        const day = date.toLocaleDateString('en-US', { weekday: 'long' });
                        return (
                          date < new Date() || // Can't book in the past
                          !doctor.availableDays?.includes(day) || // Doctor must be available
                          date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Only book up to 30 days in advance
                        );
                      }}
                    />
                  </div>

                  {/* Time Selection */}
                  <div>
                    <h3 className="font-medium mb-3">Select Time</h3>
                    {selectedDate ? (
                      availableTimes.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {availableTimes.map((time) => (
                            <Button
                              key={time}
                              variant={selectedTime === time ? "default" : "outline"}
                              className={selectedTime === time ? "bg-primary text-white" : ""}
                              onClick={() => setSelectedTime(time)}
                            >
                              {formatTime(time)}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No available times on this day.</p>
                      )
                    ) : (
                      <p className="text-gray-500">Please select a date first.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Appointment Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Reason for Visit</h3>
                    <Select value={reason} onValueChange={setReason}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="initial-consultation">Initial Consultation</SelectItem>
                        <SelectItem value="follow-up">Follow-up Appointment</SelectItem>
                        <SelectItem value="test-results">Review Test Results</SelectItem>
                        <SelectItem value="treatment-plan">Discuss Treatment Plan</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Notes for Doctor (Optional)</h3>
                    <Textarea
                      placeholder="Enter any relevant information or questions you'd like to discuss..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="h-24"
                    />
                  </div>

                  <Button 
                    className="w-full bg-primary hover:bg-primary-dark text-white"
                    onClick={handleBookAppointment}
                    disabled={!selectedDate || !selectedTime || !reason}
                  >
                    Confirm Appointment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookAppointment;
