
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Star,
  MessageSquare,
  Heart,
  Clock,
  MapPin,
  Award,
  BookOpen,
  Mail,
  Phone,
  Building,
  Syringe,
  FileText,
  User,
} from "lucide-react";
import DoctorReviews from "@/components/doctor/DoctorReviews";
import { mockDoctors, mockAppointments } from "@/data/mockData";
import { DoctorProfile as DoctorProfileType } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const DoctorProfile = () => {
  const { doctorId } = useParams();
  const { currentUser } = useAuth();

  const { data: doctor, isLoading } = useQuery({
    queryKey: ["doctor", doctorId],
    queryFn: async () => {
      // Simulate API fetch
      await new Promise((resolve) => setTimeout(resolve, 500));
      const doctor = mockDoctors.find((doc) => doc.id === doctorId);
      if (!doctor) throw new Error("Doctor not found");
      return doctor as DoctorProfileType;
    },
  });

  const { data: appointments } = useQuery({
    queryKey: ["doctor-appointments", doctorId],
    queryFn: async () => {
      // Simulate API fetch
      await new Promise((resolve) => setTimeout(resolve, 300));
      return mockAppointments.filter((apt) => apt.doctorId === doctorId);
    },
  });

  const handleFollow = () => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to follow this doctor",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Success",
      description: "You are now following this doctor",
    });
  };

  const handleMessage = () => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to message this doctor",
        variant: "destructive",
      });
      return;
    }
    // Navigate to messages page with this doctor pre-selected
    window.location.href = `/messages?doctor=${doctorId}`;
  };

  if (isLoading || !doctor) {
    return (
      <Layout>
        <div className="container py-8">
          <p className="text-center">Loading doctor profile...</p>
        </div>
      </Layout>
    );
  }

  // Determine doctor emoji based on name (this is just a placeholder logic)
  const doctorEmoji = doctor.name.toLowerCase().includes('jane') || 
                      doctor.name.toLowerCase().includes('mary') || 
                      doctor.name.toLowerCase().includes('sarah') ? '👩‍⚕️' : '👨‍⚕️';

  return (
    <Layout>
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Doctor Info Card */}
          <div className="md:col-span-1 space-y-6">
            <Card className="overflow-hidden">
              <div className="bg-accent h-24 relative">
                <Avatar className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 h-24 w-24 border-4 border-background">
                  <AvatarImage src={doctor.profileImage} alt={doctor.name} />
                  <AvatarFallback>{doctor.name[0]}</AvatarFallback>
                </Avatar>
              </div>
              
              <CardHeader className="pt-16 text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <span>{doctorEmoji}</span>
                  <span>Dr. {doctor.name}</span>
                </CardTitle>
                <CardDescription>{doctor.specialty}</CardDescription>
                <div className="flex justify-center items-center mt-2">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="ml-1 font-medium">{doctor.rating || 0}</span>
                  <span className="ml-1 text-muted-foreground">
                    ({doctor.reviews?.length || 0} reviews)
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="text-center">
                <div className="flex justify-center gap-3 mb-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-full"
                    onClick={handleFollow}
                  >
                    <Heart className="h-4 w-4 mr-1" />
                    Follow
                  </Button>
                  <Button 
                    size="sm"
                    className="rounded-full"
                    onClick={handleMessage}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Message
                  </Button>
                </div>
                
                <div className="flex items-center justify-center text-sm mb-3">
                  <Building className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span>{doctor.workPlace || "Private Practice"}</span>
                </div>
                
                <div className="flex items-center justify-center text-sm">
                  <Award className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span>{doctor.experience || 0} years of experience</span>
                </div>
              </CardContent>
              
              <Separator />
              
              <CardFooter className="flex flex-col items-start p-4">
                <h4 className="font-medium mb-2 flex items-center">
                  <Award className="h-4 w-4 mr-2" />
                  Certifications
                </h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {doctor.certifications?.map((cert, index) => (
                    <Badge key={index} variant="outline">
                      {cert}
                    </Badge>
                  ))}
                </div>
                
                <h4 className="font-medium mb-2 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Biography
                </h4>
                <p className="text-sm text-muted-foreground">
                  {doctor.bio || "This doctor has not added a bio yet."}
                </p>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{doctor.email}</span>
                </div>
                {doctor.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{doctor.phone}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Link to={`/book-appointment/${doctor.id}`} className="w-full">
                  <Button className="w-full">Book Appointment</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
          
          {/* Doctor Content Area */}
          <div className="md:col-span-2 space-y-6">
            {/* Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Availability Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                {doctor.availableDays?.length ? (
                  <div className="space-y-4">
                    {doctor.availableHours?.map((schedule) => (
                      <div key={schedule.day} className="flex items-center">
                        <div className="w-24 font-medium">{schedule.day}</div>
                        <div className="flex flex-wrap gap-2">
                          {schedule.hours.map((hour, i) => (
                            <div key={i} className="bg-accent rounded-md px-3 py-1 text-sm flex items-center">
                              <Clock className="mr-1 h-3 w-3" />
                              {hour.start} - {hour.end}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No availability schedule provided.</p>
                )}
              </CardContent>
            </Card>
            
            {/* Reviews */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <Star className="mr-2 h-5 w-5" />
                  Patient Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DoctorReviews doctorId={doctor.id} />
              </CardContent>
            </Card>
            
            {/* Latest Posts */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Latest Health Posts
                </CardTitle>
                <Link to={`/healthy-talk?doctor=${doctor.id}`} className="text-sm text-primary">
                  View all
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* This would be populated from the API in a real app */}
                  <p className="text-muted-foreground">No posts yet from this doctor.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorProfile;
