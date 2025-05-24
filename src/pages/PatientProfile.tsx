import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/types';
import Layout from '../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Ruler, 
  Weight, 
  Heart, 
  Activity,
  Pill,
  AlertCircle,
  Clock
} from 'lucide-react';

interface WorkingHour {
  day: string;
  from: string;
  to: string;
}

interface PatientInfo {
  fullName: string;
  profileImage: string;
  email: string;
  phoneNumber: string;
  gender: string;
  age: number;
  height: number;
  weight: number;
  bloodType: string;
  medicalCondition: string;
  chronicDiseases: string[];
  currentMedications: string[];
  workingHours: WorkingHour[];
}

const PatientProfile = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  // This would typically come from your API/Redux store
  const patientInfo: PatientInfo = {
    fullName: "Ahmed Mohamed",
    profileImage: "https://res.cloudinary.com/dqicm2ir2/image/upload/v1748043991/users/profileImage-1748043989653-ERD_for_Educational_Platform.png.png",
    email: "rmdanyoussef@gmail.com",
    phoneNumber: "+201234567890",
    gender: "male",
    age: 30,
    height: 175,
    weight: 75,
    bloodType: "O+",
    medicalCondition: "Healthy",
    chronicDiseases: ["Hypertension", "Diabetes"],
    currentMedications: ["Insulin", "Captopril"],
    workingHours: [
      { day: "Monday", from: "09:00", to: "17:00" },
      { day: "Tuesday", from: "09:00", to: "17:00" },
      { day: "Wednesday", from: "09:00", to: "17:00" },
      { day: "Thursday", from: "09:00", to: "17:00" },
      { day: "Friday", from: "09:00", to: "15:00" }
    ]
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column - Personal Information */}
          <div className="md:col-span-4">
            <Card>
              <CardContent className="pt-6">
                {/* Profile Header with Purple Background */}
                <div className="relative">
                  <div className="absolute top-0 left-0 right-0 h-24 bg-primary/20 rounded-t-lg"></div>
                  <div className="relative pt-8 px-4 text-center">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white shadow-lg">
                      <img 
                        src={patientInfo.profileImage}
                        alt={patientInfo.fullName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h2 className="text-xl font-bold mb-1">{patientInfo.fullName}</h2>
                    <p className="text-gray-600 text-sm mb-4">Patient ID: {currentUser?.id}</p>
                    
                    <Button 
                      size="sm"
                      className="w-full bg-primary mb-6"
                      onClick={() => navigate('/book-appointment')}
                    >
                      Book Appointment
                    </Button>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="border-t pt-4 space-y-4">
                  <div className="px-4">
                    <h3 className="font-semibold mb-2">Personal Information</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Gender:</span>
                        <span className="capitalize">{patientInfo.gender}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Age:</span>
                        <span>{patientInfo.age} years</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{patientInfo.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{patientInfo.phoneNumber}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Medical Information */}
          <div className="md:col-span-8 space-y-6">
            {/* Working Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Availability Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {patientInfo.workingHours.map((schedule, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-medium w-32">{schedule.day}</span>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                          {schedule.from} - {schedule.to}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Physical Measurements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Physical Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
                    <Ruler className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-gray-600">Height</p>
                      <p className="font-semibold">{patientInfo.height} cm</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
                    <Weight className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-gray-600">Weight</p>
                      <p className="font-semibold">{patientInfo.weight} kg</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
                    <Heart className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-gray-600">Blood Type</p>
                      <p className="font-semibold">{patientInfo.bloodType}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical Condition */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Medical Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Current Condition</h3>
                    <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full">
                      <Activity className="h-4 w-4" />
                      {patientInfo.medicalCondition}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Chronic Diseases</h3>
                    <div className="flex flex-wrap gap-2">
                      {patientInfo.chronicDiseases.map((disease, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm"
                        >
                          <AlertCircle className="h-4 w-4" />
                          {disease}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Current Medications</h3>
                    <div className="flex flex-wrap gap-2">
                      {patientInfo.currentMedications.map((medication, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                        >
                          <Pill className="h-4 w-4" />
                          {medication}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Appointment History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 py-4">
                  No recent appointments found.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PatientProfile; 