import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/types';
import Layout from '../components/layout/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';
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
        <div className="container mx-auto py-12 px-4 text-center">
          <p>Loading specialties...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Cancer Specialties</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specialties.map((specialty) => (
            <Card key={specialty._id} className="hover:shadow-md transition-all overflow-hidden">
              <div className="relative h-48 w-full">
                <img 
                  src={specialty.imageCover} 
                  alt={specialty.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle>{specialty.name}</CardTitle>
                <CardDescription className="line-clamp-2">{specialty.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">Available Doctors:</span>
                  <span>{specialty.doctorsCount}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-primary hover:bg-primary-dark text-white"
                  onClick={() => navigate(`/specialties/${specialty._id}`)}
                >
                  View Doctors <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}

          {specialties.length === 0 && (
            <div className="col-span-3 text-center py-12">
              <p className="text-gray-500">No specialties available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Specialties;
