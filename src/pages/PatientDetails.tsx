import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Image, File, Download } from 'lucide-react';
import api from '../redux/api';

interface PatientFile {
  id: string;
  fileName: string;
  fileType: string;
  uploadDate: string;
}

interface PatientData {
  personalInformation: {
    fullName: string;
    age: number;
    gender: string;
    bloodType: string;
  };
  medicalCondition: {
    currentCondition: string;
    chronicDiseases: string[];
    currentMedications: string[];
  };
  contact: {
    email: string;
    phoneNumber: string;
  };
  files: PatientFile[];
}

const PatientDetails = () => {
  const { patientId } = useParams();
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const response = await api.get(`/api/v1/users/patients/${patientId}`);
        setPatientData(response.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch patient data');
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading patient data...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !patientData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-red-500">{error || 'Patient data not found'}</p>
        </div>
      </DashboardLayout>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return <Image className="w-6 h-6" />;
    if (fileType.includes('pdf')) return <FileText className="w-6 h-6" />;
    return <File className="w-6 h-6" />;
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Patient Files: {patientData.personalInformation.fullName}</h1>
          <p className="text-gray-500">View and manage diagnostic files for this patient</p>
        </div>

        {/* Patient Summary Card */}
        <Card className="bg-white">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Patient Summary</h2>
            <div className="grid grid-cols-3 gap-8">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Personal Information</h3>
                <p className="text-gray-900">{patientData.personalInformation.age} years old, {patientData.personalInformation.gender}</p>
                <p className="text-gray-900">{patientData.personalInformation.bloodType} blood type</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Medical Condition</h3>
                <p className="text-gray-900">{patientData.medicalCondition.currentCondition}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Contact</h3>
                <p className="text-gray-900">{patientData.contact.email}</p>
                <p className="text-gray-900">{patientData.contact.phoneNumber}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Management Section */}
        <div className="space-y-4">
          {/* Search and Actions */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <Input 
                type="text" 
                placeholder="Search files by name..." 
                className="w-full"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All File Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All File Types</SelectItem>
                <SelectItem value="images">Images</SelectItem>
                <SelectItem value="documents">Documents</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">Request New Files</Button>
            <Button>Upload Files</Button>
          </div>

          {/* File Type Tabs */}
          <div className="flex gap-4 border-b">
            <button
              className={`pb-2 px-1 ${
                activeTab === 'all'
                  ? 'border-b-2 border-primary text-primary font-medium'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('all')}
            >
              All Files (4)
            </button>
            <button
              className={`pb-2 px-1 ${
                activeTab === 'images'
                  ? 'border-b-2 border-primary text-primary font-medium'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('images')}
            >
              Images (2)
            </button>
            <button
              className={`pb-2 px-1 ${
                activeTab === 'documents'
                  ? 'border-b-2 border-primary text-primary font-medium'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('documents')}
            >
              Documents (2)
            </button>
            <button
              className={`pb-2 px-1 ${
                activeTab === 'other'
                  ? 'border-b-2 border-primary text-primary font-medium'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('other')}
            >
              Other (0)
            </button>
          </div>

          {/* Files Grid */}
          <div className="grid grid-cols-3 gap-4">
            {/* Example files - replace with actual data */}
            <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <Image className="w-6 h-6 text-gray-500" />
                <div>
                  <p className="font-medium">brain_scan.png</p>
                  <p className="text-sm text-gray-500">May 5, 2025</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                <Download className="w-4 h-4" />
              </Button>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <Image className="w-6 h-6 text-gray-500" />
                <div>
                  <p className="font-medium">skin_biopsy.jpg</p>
                  <p className="text-sm text-gray-500">May 6, 2025</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                <Download className="w-4 h-4" />
              </Button>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-gray-500" />
                <div>
                  <p className="font-medium">lab_results.pdf</p>
                  <p className="text-sm text-gray-500">May 8, 2025</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientDetails; 