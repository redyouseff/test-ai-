
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import { mockSpecialties, mockDoctors } from '../data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserRole } from '../types';

const Specialties = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const role: UserRole = currentUser?.role || 'patient';

  const handleSpecialtyClick = (specialtyId: string) => {
    navigate(`/specialties/${specialtyId}`);
  };

  // Count doctors by specialty
  const getDoctorCountBySpecialty = (specialtyId: string) => {
    return mockDoctors.filter(doctor => doctor.specialty === specialtyId).length;
  };

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Cancer Specialties</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Browse our specialized cancer departments and find experts for diagnosis and treatment plans tailored to your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {mockSpecialties.map((specialty) => (
            <Card 
              key={specialty.id} 
              className="hover:shadow-lg transition-all cursor-pointer"
              onClick={() => handleSpecialtyClick(specialty.id)}
            >
              <CardHeader className="text-center pb-2">
                <div className="w-20 h-20 mx-auto rounded-full bg-accent flex items-center justify-center mb-4">
                  <span className="text-4xl">
                    {specialty.icon === 'brain' && '🧠'}
                    {specialty.icon === 'user' && '👤'}
                    {specialty.icon === 'heart' && '🫁'}
                  </span>
                </div>
                <CardTitle className="text-xl">{specialty.name}</CardTitle>
                <CardDescription className="text-sm">
                  {getDoctorCountBySpecialty(specialty.id)} specialists available
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="mb-6 text-gray-600">{specialty.description}</p>
                <Button 
                  className="bg-primary hover:bg-primary-dark text-white"
                  onClick={() => handleSpecialtyClick(specialty.id)}
                >
                  View Specialists
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 max-w-3xl mx-auto bg-accent rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Need Help Choosing a Specialty?</h2>
          <p className="text-gray-700 mb-6">
            If you're unsure which specialty is right for your condition, we can help guide you to the appropriate care.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-md shadow-sm">
              <h3 className="font-semibold mb-2">Brain Cancer Department</h3>
              <p className="text-sm text-gray-600 mb-4">
                For headaches, neurological symptoms, brain imaging abnormalities, or history of brain tumors.
              </p>
              <Button 
                variant="outline" 
                className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                onClick={() => handleSpecialtyClick('brain-cancer')}
              >
                Learn More
              </Button>
            </div>
            <div className="bg-white p-6 rounded-md shadow-sm">
              <h3 className="font-semibold mb-2">Skin Cancer Department</h3>
              <p className="text-sm text-gray-600 mb-4">
                For suspicious moles, skin lesions, changes in existing marks, or history of skin cancer.
              </p>
              <Button 
                variant="outline" 
                className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                onClick={() => handleSpecialtyClick('skin-cancer')}
              >
                Learn More
              </Button>
            </div>
            <div className="bg-white p-6 rounded-md shadow-sm">
              <h3 className="font-semibold mb-2">Chest Cancer Department</h3>
              <p className="text-sm text-gray-600 mb-4">
                For persistent cough, chest pain, breathing difficulties, or abnormal chest imaging.
              </p>
              <Button 
                variant="outline" 
                className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                onClick={() => handleSpecialtyClick('chest-cancer')}
              >
                Learn More
              </Button>
            </div>
            <div className="bg-white p-6 rounded-md shadow-sm">
              <h3 className="font-semibold mb-2">Contact Our Care Team</h3>
              <p className="text-sm text-gray-600 mb-4">
                Still not sure? Our team can guide you to the appropriate specialist based on your symptoms.
              </p>
              <Button 
                className="w-full bg-primary hover:bg-primary-dark text-white"
              >
                Contact Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Specialties;
