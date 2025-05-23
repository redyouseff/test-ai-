
import { useNavigate } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 mt-auto py-8 px-6 border-t border-gray-200">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <h3 
              className="text-xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent cursor-pointer mb-4"
              onClick={() => navigate('/')}
            >
              CareInsight
            </h3>
            <p className="text-gray-600 text-sm">
              Advanced healthcare platform connecting patients with specialized care for cancer diagnostics and treatment.
            </p>
          </div>

          <div className="col-span-1">
            <h4 className="font-medium text-gray-800 mb-3">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  className="text-gray-600 hover:text-primary text-sm cursor-pointer"
                  onClick={() => navigate('/')}
                >
                  Home
                </a>
              </li>
              <li>
                <a 
                  className="text-gray-600 hover:text-primary text-sm cursor-pointer"
                  onClick={() => navigate('/about')}
                >
                  About Us
                </a>
              </li>
              <li>
                <a 
                  className="text-gray-600 hover:text-primary text-sm cursor-pointer"
                  onClick={() => navigate('/specialties')}
                >
                  Cancer Specialties
                </a>
              </li>
              <li>
                <a 
                  className="text-gray-600 hover:text-primary text-sm cursor-pointer"
                  onClick={() => navigate('/laboratories')}
                >
                  Laboratories
                </a>
              </li>
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="font-medium text-gray-800 mb-3">For Patients</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  className="text-gray-600 hover:text-primary text-sm cursor-pointer"
                  onClick={() => navigate('/register')}
                >
                  Register as Patient
                </a>
              </li>
              <li>
                <a 
                  className="text-gray-600 hover:text-primary text-sm cursor-pointer"
                  onClick={() => navigate('/appointments')}
                >
                  Book Appointment
                </a>
              </li>
              <li>
                <a 
                  className="text-gray-600 hover:text-primary text-sm cursor-pointer"
                  onClick={() => navigate('/dashboard')}
                >
                  Patient Dashboard
                </a>
              </li>
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="font-medium text-gray-800 mb-3">For Doctors</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  className="text-gray-600 hover:text-primary text-sm cursor-pointer"
                  onClick={() => navigate('/register')}
                >
                  Register as Doctor
                </a>
              </li>
              <li>
                <a 
                  className="text-gray-600 hover:text-primary text-sm cursor-pointer"
                  onClick={() => navigate('/dashboard')}
                >
                  Doctor Dashboard
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">
            © {currentYear} CareInsight. All rights reserved.
          </p>

          <div className="flex space-x-6 mt-4 md:mt-0">
            <a className="text-gray-600 hover:text-primary text-sm">
              Privacy Policy
            </a>
            <a className="text-gray-600 hover:text-primary text-sm">
              Terms of Service
            </a>
            <a className="text-gray-600 hover:text-primary text-sm">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
