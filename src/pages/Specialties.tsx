import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/types';
import Layout from '../components/layout/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Stethoscope, Heart, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from "@/components/ui/use-toast";

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

const Specialties = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
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

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-white to-primary/5">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-primary/5 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('/patterns/grid.svg')] opacity-5"></div>
        
        <div className="container mx-auto py-28 px-4 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Floating Badge */}
            <div className="inline-block animate-bounce">
              <div className="relative">
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-primary/30 to-primary-dark/30 blur-md"></div>
                <span className="relative bg-white/95 text-primary px-6 py-2 rounded-full text-sm font-medium shadow-xl border border-primary/10 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-primary animate-pulse" />
                  <span>Healthcare Specialties</span>
                  <Activity className="w-4 h-4 text-primary animate-pulse" />
                </span>
              </div>
            </div>

            {/* Main Title */}
            <div className="relative">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold">
                <span className="bg-gradient-to-r from-primary via-primary-dark to-primary bg-clip-text text-transparent animate-gradient">
                  Cancer Care
                </span>
                <br />
                <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                  Specialties
                </span>
              </h1>
            </div>

            {/* Description */}
            <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-light">
              Find specialized doctors and treatments for different types of cancer care
            </p>

            {/* Decorative Line */}
            <div className="flex items-center justify-center gap-2">
              <div className="w-12 h-1 rounded-full bg-gradient-to-r from-transparent to-primary/60"></div>
              <div className="w-24 h-1 rounded-full bg-gradient-to-r from-primary to-primary-dark animate-pulse"></div>
              <div className="w-12 h-1 rounded-full bg-gradient-to-r from-primary/60 to-transparent"></div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-12 max-w-3xl mx-auto">
              <div className="text-center group hover:scale-105 transition-transform duration-300 cursor-pointer">
                <div className="text-3xl font-bold text-primary mb-1 group-hover:animate-pulse">{specialties.length}</div>
                <div className="text-gray-600">Specialties</div>
              </div>
              <div className="text-center group hover:scale-105 transition-transform duration-300 cursor-pointer">
                <div className="text-3xl font-bold text-primary mb-1 group-hover:animate-pulse">
                  {specialties.reduce((sum, specialty) => sum + specialty.doctorsCount, 0)}
                </div>
                <div className="text-gray-600">Specialists</div>
              </div>
              <div className="text-center md:col-span-1 col-span-2 group hover:scale-105 transition-transform duration-300 cursor-pointer">
                <div className="text-3xl font-bold text-primary mb-1 group-hover:animate-pulse">24/7</div>
                <div className="text-gray-600">Care Available</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Specialties Grid */}
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {specialties.map((specialty) => (
            <Card 
              key={specialty._id} 
              className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-2 hover:border-primary/20"
            >
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={specialty.imageCover} 
                  alt={specialty.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white mb-1">{specialty.name}</h3>
                  <div className="flex items-center gap-2 text-white/80">
                    <Users className="w-4 h-4" />
                    <span>{specialty.doctorsCount} Specialists Available</span>
                  </div>
                </div>
              </div>
              <CardContent className="pt-6">
                <p className="text-gray-600 line-clamp-3">{specialty.description}</p>
              </CardContent>
              <CardFooter className="pt-0">
                <Button 
                  className="w-full bg-white hover:bg-primary hover:text-white text-primary border-2 border-primary/20 group-hover:border-primary transition-colors"
                  onClick={() => navigate(`/specialties/${specialty._id}`)}
                >
                  <span>View Specialists</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {specialties.length === 0 && (
          <div className="text-center py-12">
            <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Specialties Available</h3>
            <p className="text-gray-500">No specialties are available at the moment.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Specialties;
