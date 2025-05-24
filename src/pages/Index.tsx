import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/types';
import Layout from '../components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface Specialty {
  _id: string;
  name: string;
  description: string;
  imageCover: string;
  doctorsCount: number;
}

interface ApiResponse {
  message: string;
  data: Specialty[];
}

const Index = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { toast } = useToast();
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const response = await axios.get<ApiResponse>('https://care-insight-api-9ed25d3ea3ea.herokuapp.com/api/v1/specialties');
        if (response.data.message === "success") {
          setSpecialties(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching specialties:', error);
        toast({
          title: "Error",
          description: "Failed to load specialties. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialties();
  }, [toast]);
    
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-white to-secondary py-16 md:py-24">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            Advanced Cancer Care and Diagnostics
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
            Connect with specialized cancer doctors, get AI-powered diagnostics, and manage your healthcare journey in one place.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {user ? (
              <Button 
                className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-md text-lg"
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button 
                  className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-md text-lg"
                  onClick={() => navigate('/register')}
                >
                  Register Now
                </Button>
                <Button 
                  variant="outline" 
                  className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 rounded-md text-lg"
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Specialities Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Cancer Specialties</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We offer specialized diagnosis and treatment for various types of cancer, with dedicated doctors and advanced AI-powered diagnostics.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-gray-600">Loading specialties...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {specialties.map((specialty) => (
                  <div 
                    key={specialty._id}
                    className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => navigate(`/specialties/${specialty._id}`)}
                  >
                    <div className="relative h-64 w-full overflow-hidden">
                      <img 
                        src={specialty.imageCover} 
                        alt={specialty.name}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl font-semibold mb-3 text-center text-gray-900">{specialty.name}</h3>
                      <p className="text-gray-600 text-center mb-4 line-clamp-2">{specialty.description}</p>
                      <div className="flex items-center justify-center text-sm text-gray-500 border-t pt-4">
                        <span className="font-medium">Available Doctors:</span>
                        <span className="ml-2">{specialty.doctorsCount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-12">
                <Button 
                  className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-md text-lg"
                  onClick={() => navigate('/specialties')}
                >
                  View All Specialties
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-accent">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How CareInsight Works</h2>
            <p className="text-gray-700 max-w-2xl mx-auto">
              Our platform connects patients with specialized doctors and uses AI to provide accurate diagnostics and personalized treatment plans.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 mx-auto border-2 border-primary">
                <span className="text-lg font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Register</h3>
              <p className="text-gray-700">Create an account as a patient or doctor</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 mx-auto border-2 border-primary">
                <span className="text-lg font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Select Specialty</h3>
              <p className="text-gray-700">Choose from our cancer specialists</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 mx-auto border-2 border-primary">
                <span className="text-lg font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Book Appointment</h3>
              <p className="text-gray-700">Schedule a visit and upload diagnostic files</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 mx-auto border-2 border-primary">
                <span className="text-lg font-bold text-primary">4</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Results</h3>
              <p className="text-gray-700">Receive AI-powered diagnosis and treatment plan</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Take Control of Your Health?</h2>
          <p className="text-xl text-white opacity-90 mb-8 max-w-xl mx-auto">
            Join CareInsight today and connect with specialized cancer doctors for expert care with advanced AI diagnostics.
          </p>
          <Button 
            variant="secondary" 
            className="bg-white text-primary hover:bg-gray-100 px-8 py-3 rounded-md text-lg"
            onClick={() => navigate('/register')}
          >
            Register Now
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
