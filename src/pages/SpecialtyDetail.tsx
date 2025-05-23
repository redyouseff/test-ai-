
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import { mockDoctors, mockSpecialties } from '../data/mockData';
import { DoctorProfile, Specialty } from '../types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Star, User, MessageCircle, UserPlus } from 'lucide-react';

const SpecialtyDetail = () => {
  const { specialtyId } = useParams<{ specialtyId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [specialty, setSpecialty] = useState<Specialty | null>(null);
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!specialtyId) return;

    // Find the specialty
    const foundSpecialty = mockSpecialties.find(spec => spec.id === specialtyId);
    if (foundSpecialty) {
      setSpecialty(foundSpecialty);
    }

    // Find doctors with this specialty
    const specialtyDoctors = mockDoctors.filter(doctor => doctor.specialty === specialtyId);
    setDoctors(specialtyDoctors);
    setLoading(false);
  }, [specialtyId]);

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
        <div className="container mx-auto py-12 px-4 text-center">
          <p>Loading specialty information...</p>
        </div>
      </Layout>
    );
  }

  if (!specialty) {
    return (
      <Layout>
        <div className="container mx-auto py-12 px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Specialty Not Found</h1>
          <p className="mb-8">The specialty you are looking for does not exist.</p>
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
          <div className="w-20 h-20 mx-auto rounded-full bg-accent flex items-center justify-center mb-4">
            <span className="text-4xl">
              {specialty.icon === 'brain' && '🧠'}
              {specialty.icon === 'user' && '👤'}
              {specialty.icon === 'heart' && '🫁'}
            </span>
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
            {doctors.length > 0 ? (
              doctors.map((doctor) => (
                <Card key={doctor.id} className="hover:shadow-md transition-all">
                  <CardHeader className="pb-2">
                    <div className="flex items-start">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mr-4">
                        {doctor.profileImage ? (
                          <img 
                            src={doctor.profileImage} 
                            alt={doctor.name} 
                            className="w-full h-full rounded-full object-cover" 
                          />
                        ) : (
                          <User size={32} className="text-gray-500" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{doctor.name}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <span className="flex items-center text-amber-500">
                            <Star size={14} className="fill-current" />
                            <span className="ml-1">{doctor.rating}</span>
                          </span>
                          <span className="mx-2">•</span>
                          <span>{doctor.experience} years experience</span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm text-gray-600 mb-2">{doctor.bio}</p>
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
                    <div className="mt-4">
                      <h4 className="font-medium text-sm">Work Place:</h4>
                      <p className="text-sm text-gray-600 mt-1">{doctor.workPlace}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 pb-4 flex flex-wrap gap-2">
                    <Button 
                      className="bg-primary hover:bg-primary-dark text-white flex-1"
                      onClick={() => handleBookAppointment(doctor.id)}
                    >
                      <Calendar className="mr-2 h-4 w-4" /> Book
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleViewProfile(doctor.id)}
                    >
                      <User className="mr-2 h-4 w-4" /> Profile
                    </Button>
                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={() => handleStartChat(doctor.id)}
                    >
                      <MessageCircle className="h-5 w-5" />
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <p className="col-span-3 text-center text-gray-500 py-10">
                No doctors available for this specialty at the moment.
              </p>
            )}
          </div>
        </div>

        {/* About Section */}
        <div className="bg-accent rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">About {specialty.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-3">What is {specialty.name}?</h3>
              <p className="text-gray-700 mb-4">
                {specialty.id === 'brain-cancer' && 
                  "Brain cancer develops from cells within the brain or from cells that have spread to the brain from elsewhere in the body. Our department specializes in the diagnosis, treatment, and management of various types of brain tumors."}
                {specialty.id === 'skin-cancer' && 
                  "Skin cancer is the abnormal growth of skin cells, most often developing on skin exposed to the sun but can also occur in areas not ordinarily exposed. Our dermatological oncology team is expert in detecting and treating all forms of skin cancer."}
                {specialty.id === 'chest-cancer' && 
                  "Chest cancers include lung cancer, pleural mesothelioma, and other malignancies affecting the thoracic region. Our chest oncology department provides comprehensive care for the diagnosis and treatment of these conditions."}
              </p>
              <h3 className="text-lg font-semibold mb-3">Warning Signs</h3>
              <ul className="list-disc pl-5 text-gray-700 mb-4">
                {specialty.id === 'brain-cancer' && (
                  <>
                    <li>Persistent headaches</li>
                    <li>Seizures</li>
                    <li>Vision or hearing problems</li>
                    <li>Balance or coordination problems</li>
                    <li>Personality changes</li>
                  </>
                )}
                {specialty.id === 'skin-cancer' && (
                  <>
                    <li>New growths or changes in existing moles</li>
                    <li>Unusual skin patches or sores that don't heal</li>
                    <li>Asymmetrical moles</li>
                    <li>Moles with irregular borders</li>
                    <li>Changes in color or size of skin marks</li>
                  </>
                )}
                {specialty.id === 'chest-cancer' && (
                  <>
                    <li>Persistent cough</li>
                    <li>Chest pain</li>
                    <li>Shortness of breath</li>
                    <li>Unexplained weight loss</li>
                    <li>Coughing up blood</li>
                  </>
                )}
              </ul>
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
              <div className="mt-6">
                <Button 
                  className="bg-primary hover:bg-primary-dark text-white"
                  onClick={() => doctors.length > 0 && handleBookAppointment(doctors[0].id)}
                >
                  Book a Consultation
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SpecialtyDetail;
