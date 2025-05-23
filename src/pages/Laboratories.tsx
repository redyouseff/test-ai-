
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { mockLaboratories } from '../data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Laboratories = () => {
  const navigate = useNavigate();
  
  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Partner Laboratories</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Browse and book appointments with our network of diagnostic laboratories for all your testing needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {mockLaboratories.map((lab) => (
            <Card key={lab.id} className="hover:shadow-md transition-all">
              <CardHeader>
                <CardTitle>{lab.name}</CardTitle>
                <CardDescription>{lab.address}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Services</h3>
                    <div className="flex flex-wrap gap-2">
                      {lab.services.map((service, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-accent text-primary text-xs rounded-full"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Opening Hours</h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      {lab.openHours.map((hours, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="font-medium">{hours.day}</span>
                          <span className="text-gray-600">
                            {hours.open && hours.close 
                              ? `${hours.open} - ${hours.close}` 
                              : 'Closed'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Phone:</span> {lab.phone}
                    </p>
                    <Button 
                      className="bg-primary hover:bg-primary-dark text-white"
                      onClick={() => navigate(`/laboratories/${lab.id}`)}
                    >
                      Book Appointment
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 bg-accent rounded-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">Looking for a Laboratory Test?</h2>
            <p className="text-gray-700 max-w-2xl mx-auto">
              Our partner laboratories offer a wide range of diagnostic tests and services to help you monitor your health.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Book a Lab Test</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Browse our laboratory partners and book your test appointment directly through our platform.
                </p>
                <Button 
                  className="w-full bg-primary hover:bg-primary-dark text-white"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  Find a Laboratory
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Access your laboratory test results securely through your patient dashboard once they're available.
                </p>
                <Button 
                  className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                >
                  View Results
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Urgent Testing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Need urgent diagnostic testing? Contact our care team for expedited appointments with partner labs.
                </p>
                <Button 
                  className="w-full bg-primary hover:bg-primary-dark text-white"
                >
                  Contact Care Team
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Laboratories;
