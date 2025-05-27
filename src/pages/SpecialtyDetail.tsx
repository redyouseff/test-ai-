import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/types';
import Layout from '../components/layout/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Star, User, MessageCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useToast } from "@/components/ui/use-toast";
import MessageButton from '@/components/common/MessageButton';

interface WorkingHours {
  day: string;
  from: string;
  to: string;
}

interface Doctor {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  specialty: {
    _id: string;
    name: string;
    description: string;
  };
  clinicLocation: string;
  certifications: string[];
  workingHours: WorkingHours[];
  availability: string[];
  profileImage: string;
  averageRating: number;
  numberOfReviews: number;
}

interface Specialty {
  _id: string;
  name: string;
  description: string;
  imageCover: string;
  doctorsCount: number;
}

interface DoctorsApiResponse {
  message: string;
  results: number;
  users: Doctor[];
}

interface SpecialtyResponse {
  message: string;
  data: Specialty;
}

const SpecialtyDetail = () => {
  const { specialtyId } = useParams<{ specialtyId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [specialty, setSpecialty] = useState<Specialty | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!specialtyId) {
        setError("No specialty ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch specialty details
        const specialtyResponse = await axios.get<SpecialtyResponse>(
          `https://care-insight-api-9ed25d3ea3ea.herokuapp.com/api/v1/specialties/${specialtyId}`
        );

        if (specialtyResponse.data.message === "success") {
          setSpecialty(specialtyResponse.data.data);
        }

        // Fetch doctors for this specialty
        const doctorsResponse = await axios.get<DoctorsApiResponse>(
          `https://care-insight-api-9ed25d3ea3ea.herokuapp.com/api/v1/specialties/${specialtyId}/users`
        );

        if (doctorsResponse.data.message === "success") {
          setDoctors(doctorsResponse.data.users || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError("Failed to load specialty information. Please try again later.");
        toast({
          title: "Error",
          description: "Failed to load specialty information. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [specialtyId, toast]);

  const handleBookAppointment = (doctorId: string) => {
    if (currentUser) {
      navigate(`/book-appointment/${doctorId}`);
    } else {
      navigate('/login', { state: { redirectTo: `/book-appointment/${doctorId}` } });
    }
  };
  
  const handleViewProfile = (doctorId: string) => {
    navigate(`/doctor/${doctorId}`);
  };
  
  const handleStartChat = (doctorId: string) => {
    if (currentUser) {
      navigate(`/messages?doctorId=${doctorId}`);
    } else {
      navigate('/login', { state: { redirectTo: `/messages?doctorId=${doctorId}` } });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-12 px-4">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-gray-600">Loading specialty information...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !specialty) {
    return (
      <Layout>
        <div className="container mx-auto py-12 px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">
            {error || "Specialty Not Found"}
          </h1>
          <p className="mb-8">
            {error ? "An error occurred while loading the specialty." : "The specialty you are looking for does not exist."}
          </p>
          <Button 
            className="bg-primary hover:bg-primary-dark text-white"
            onClick={() => navigate('/specialties')}
          >
            Back to Specialties
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        {/* Specialty Header */}
        <div className="mb-12 text-center">
          <div className="w-48 h-48 mx-auto mb-8 rounded-full overflow-hidden shadow-lg">
            <img 
              src={specialty.imageCover}
              alt={specialty.name}
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{specialty.name}</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {specialty.description}
          </p>
        </div>

        {/* Doctors List */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Our {specialty.name} Specialists</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors && doctors.length > 0 ? (
              doctors.map((doctor) => (
                <Card key={doctor._id} className="hover:shadow-md transition-all">
                  <CardHeader className="pb-2">
                    <div className="flex items-start">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mr-4">
                        {doctor.profileImage ? (
                          <img 
                            src={doctor.profileImage} 
                            alt={doctor.fullName} 
                            className="w-full h-full rounded-full object-cover" 
                          />
                        ) : (
                          <User size={32} className="text-gray-500" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{doctor.fullName}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          {doctor.averageRating > 0 && (
                            <>
                              <span className="flex items-center text-amber-500">
                                <Star size={14} className="fill-current" />
                                <span className="ml-1">{doctor.averageRating}</span>
                              </span>
                              <span className="mx-2">•</span>
                            </>
                          )}
                          <span>{doctor.numberOfReviews} reviews</span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm text-gray-600 mb-2">
                      {doctor.clinicLocation}
                    </p>
                    {doctor.certifications && doctor.certifications.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-sm">Certifications:</h4>
                        <ul className="text-sm text-gray-600 mt-1">
                          {doctor.certifications.map((cert, index) => (
                            <li key={index} className="inline-flex items-center mr-4">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary-light mr-1"></span>
                              {cert}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {doctor.workingHours && doctor.workingHours.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-sm">Working Hours:</h4>
                        <div className="text-sm text-gray-600 mt-1">
                          {doctor.workingHours
                            .filter(hours => hours.from && hours.to)
                            .map((hours, index) => (
                              <p key={index}>
                                {hours.day}: {hours.from} - {hours.to}
                              </p>
                            ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-2 pb-4 flex flex-wrap items-center gap-1.5">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-primary text-white"
                        onClick={() => navigate(`/book-appointment/${doctor._id}`)}
                      >
                        Book Appointment
                      </Button>
                      <MessageButton 
                        userId={doctor._id}
                        variant="outline"
                        size="sm"
                        showIcon={true}
                      />
                    </div>
                    <Button 
                      variant="outline"
                      className="flex-1 h-8 text-sm px-3 flex items-center justify-center rounded-full"
                      onClick={() => handleViewProfile(doctor._id)}
                    >
                      <span className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center mr-1.5">
                        <User className="h-2.5 w-2.5" />
                      </span>
                      Profile
                    </Button>
                    <Button 
                      variant="ghost"
                      className="w-7 h-7 p-0 rounded-full flex items-center justify-center"
                      onClick={() => handleStartChat(doctor._id)}
                    >
                      <span className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <MessageCircle className="h-2.5 w-2.5" />
                      </span>
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 bg-gray-50 rounded-lg">
                <User size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Doctors Available</h3>
                <p className="text-gray-500">There are currently no doctors available for this specialty.</p>
              </div>
            )}
          </div>
        </div>

        {/* About Section */}
        <div className="bg-accent rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6">About {specialty.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-3">What is {specialty.name}?</h3>
              <p className="text-gray-700 mb-4">{specialty.description}</p>
              <div className="mt-6">
                <Button 
                  className="bg-primary hover:bg-primary-dark text-white"
                  onClick={() => doctors && doctors.length > 0 && handleBookAppointment(doctors[0]._id)}
                  disabled={!doctors || doctors.length === 0}
                >
                  Book a Consultation
                </Button>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Our Approach</h3>
              <p className="text-gray-700 mb-4">
                Our {specialty.name} department combines clinical expertise with advanced AI diagnostic technology to provide comprehensive care. We offer:
              </p>
              <ul className="list-disc pl-5 text-gray-700">
                <li>Specialized diagnostic imaging</li>
                <li>AI-powered early detection</li>
                <li>Multidisciplinary treatment planning</li>
                <li>Minimally invasive treatment options</li>
                <li>Ongoing monitoring and follow-up care</li>
                <li>Support services for patients and families</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SpecialtyDetail;
