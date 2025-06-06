import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../redux/types";
import Layout from "../components/layout/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Star,
  User,
  MessageCircle,
  Loader2,
  Clock,
  ArrowRight,
} from "lucide-react";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import MessageButton from "@/components/common/MessageButton";

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
        console.error("Error fetching data:", error);
        setError(
          "Failed to load specialty information. Please try again later."
        );
        toast({
          title: "Error",
          description:
            "Failed to load specialty information. Please try again later.",
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
      navigate("/login", {
        state: { redirectTo: `/book-appointment/${doctorId}` },
      });
    }
  };

  const handleViewProfile = (doctorId: string) => {
    navigate(`/doctor/${doctorId}`);
  };

  const handleStartChat = (doctorId: string) => {
    if (currentUser) {
      navigate(`/messages?doctorId=${doctorId}`);
    } else {
      navigate("/login", {
        state: { redirectTo: `/messages?doctorId=${doctorId}` },
      });
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
            {error
              ? "An error occurred while loading the specialty."
              : "The specialty you are looking for does not exist."}
          </p>
          <Button
            className="bg-primary hover:bg-primary-dark text-white"
            onClick={() => navigate("/specialties")}
          >
            Back to Specialties
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section with Parallax Effect */}
      <div className="relative min-h-[400px] bg-gradient-to-br from-primary/90 to-primary flex items-center">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url(${specialty.imageCover})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {specialty.name}
            </h1>
            <p className="text-lg text-white/90 mb-8">
              {specialty.description}
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 text-white">
                <div className="text-2xl font-bold">{doctors.length}</div>
                <div className="text-sm opacity-90">Specialists</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 text-white">
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm opacity-90">Support</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 text-white">
                <div className="text-2xl font-bold">4.8</div>
                <div className="text-sm opacity-90">Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 -mt-20 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100%] group-hover:bg-primary/10 transition-colors duration-300" />
            <div className="relative">
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1 text-gray-900">
                    Book Appointment
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Schedule a visit with our specialists
                  </p>
                  <Button
                    variant="ghost"
                    className="text-primary p-0 h-auto font-medium hover:text-primary/90 hover:bg-transparent"
                    onClick={() =>
                      doctors &&
                      doctors.length > 0 &&
                      handleBookAppointment(doctors[0]._id)
                    }
                  >
                    Book Now
                    <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100%] group-hover:bg-primary/10 transition-colors duration-300" />
            <div className="relative">
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1 text-gray-900">
                    Online Consultation
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Chat with our doctors online
                  </p>
                  <Button
                    variant="ghost"
                    className="text-primary p-0 h-auto font-medium hover:text-primary/90 hover:bg-transparent"
                    onClick={() =>
                      doctors &&
                      doctors.length > 0 &&
                      handleStartChat(doctors[0]._id)
                    }
                  >
                    Start Chat
                    <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100%] group-hover:bg-primary/10 transition-colors duration-300" />
            <div className="relative">
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1 text-gray-900">
                    View Profiles
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Learn more about our doctors
                  </p>
                  <Button
                    variant="ghost"
                    className="text-primary p-0 h-auto font-medium hover:text-primary/90 hover:bg-transparent"
                    onClick={() =>
                      doctors &&
                      doctors.length > 0 &&
                      handleViewProfile(doctors[0]._id)
                    }
                  >
                    View All
                    <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Doctors Section */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">
              Our {specialty.name} Specialists
            </h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Filter
              </Button>
              <Button variant="outline" size="sm">
                Sort By
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {doctors && doctors.length > 0 ? (
              doctors.map((doctor) => (
                <Card
                  key={doctor._id}
                  className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-white overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Doctor Image Section */}
                    <div className="md:w-48 p-6 flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                      <div className="relative">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                          {doctor.profileImage ? (
                            <img
                              src={doctor.profileImage}
                              alt={doctor.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-primary/5 flex items-center justify-center">
                              <User size={40} className="text-primary/40" />
                            </div>
                          )}
                        </div>
                        {doctor.averageRating > 0 && (
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-full px-3 py-1 flex items-center gap-1">
                            <Star
                              size={14}
                              className="text-amber-500 fill-current"
                            />
                            <span className="font-semibold text-sm">
                              {doctor.averageRating}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Doctor Info Section */}
                    <div className="flex-1 p-6">
                      <div className="mb-4">
                        <h3 className="text-xl font-bold mb-1">
                          {doctor.fullName}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/5 text-primary">
                            {specialty.name} Specialist
                          </span>
                          {doctor.numberOfReviews > 0 && (
                            <span className="text-gray-500">
                              {doctor.numberOfReviews} reviews
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2 text-primary/60" />
                          <span className="text-sm">
                            {doctor.clinicLocation}
                          </span>
                        </div>

                        {doctor.workingHours &&
                          doctor.workingHours.length > 0 && (
                            <div className="flex items-start">
                              <Clock className="w-4 h-4 mr-2 mt-1 text-primary/60" />
                              <div className="flex-1">
                                <div className="grid grid-cols-2 gap-2">
                                  {doctor.workingHours
                                    .filter((hours) => hours.from && hours.to)
                                    .map((hours, index) => (
                                      <div
                                        key={index}
                                        className="text-sm text-gray-600"
                                      >
                                        <span className="font-medium">
                                          {hours.day}:
                                        </span>
                                        <span className="ml-1">
                                          {hours.from} - {hours.to}
                                        </span>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            </div>
                          )}
                      </div>

                      {doctor.certifications &&
                        doctor.certifications.length > 0 && (
                          <div className="mb-6">
                            <div className="flex flex-wrap gap-2">
                              {doctor.certifications.map((cert, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                                >
                                  {cert}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                      <div className="flex items-center gap-3">
                        <Button
                          className="flex-1 bg-primary hover:bg-primary-dark text-white"
                          onClick={() => handleBookAppointment(doctor._id)}
                        >
                          Book Appointment
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleViewProfile(doctor._id)}
                        >
                          View Profile
                        </Button>
                        <MessageButton
                          userId={doctor._id}
                          showIcon={true}
                          variant="outline"
                          size="icon"
                          className="w-10 h-10"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full bg-gray-50 rounded-xl p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  No Doctors Available
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  We currently don't have any specialists available in this
                  department. Please check back later or contact us for more
                  information.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SpecialtyDetail;
