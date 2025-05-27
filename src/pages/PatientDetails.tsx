import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Image, File, Download, Brain, Sparkles, AlertCircle } from 'lucide-react';
import api from '../redux/api';

interface PatientFile {
  id: string;
  name: string;
  url: string;
  type: string;
}

interface FilesResponse {
  counts: {
    all: number;
    images: number;
    documents: number;
    other: number;
  };
  results: number;
  files: PatientFile[];
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  _id: string;
}

interface MedicalRecord {
  id: string;
  diagnosis: string;
  treatment: {
    medications: Medication[];
    recommendations: string[];
  };
  doctor: {
    name: string;
    specialty: string;
  };
  date: string;
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
  medicalRecords: MedicalRecord[];
}

interface AIInsight {
  type: 'diagnosis' | 'recommendation' | 'alert';
  content: string;
  confidence: number;
}

const PatientDetails = () => {
  const { patientId } = useParams();
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [filesData, setFilesData] = useState<FilesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [aiQuery, setAiQuery] = useState('');
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const fetchFiles = async (filterBy: string = 'all') => {
    try {
      const url = filterBy === 'all' 
        ? `/api/v1/users/patients/${patientId}/files`
        : `/api/v1/users/patients/${patientId}/files?filterBy=${filterBy}`;
      
      const response = await api.get(url);
      setFilesData(response.data.data);
      setActiveTab(filterBy);
    } catch (err) {
      setError('Failed to fetch files');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientResponse] = await Promise.all([
          api.get(`/api/v1/users/patients/${patientId}`),
          fetchFiles('all')
        ]);

        setPatientData(patientResponse.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId]);

  const handleTabChange = (tab: string) => {
    fetchFiles(tab);
  };

  const filteredFiles = filesData?.files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getFileIcon = (fileType: string) => {
    if (fileType === 'image') return <Image className="w-6 h-6 text-gray-500" />;
    if (fileType === 'document') return <FileText className="w-6 h-6 text-gray-500" />;
    return <File className="w-6 h-6 text-gray-500" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Mock AI insights - Replace this with actual API call
  const generateAIInsights = async (query: string) => {
    setIsLoadingAI(true);
    try {
      // This would be replaced with an actual API call to your AI service
      const mockInsights: AIInsight[] = [
        {
          type: 'diagnosis',
          content: 'Based on the patient\'s symptoms and medical history, consider screening for cardiovascular complications due to long-term hypertension.',
          confidence: 0.85
        },
        {
          type: 'recommendation',
          content: 'Recommend monthly blood pressure monitoring and quarterly HbA1c tests given the combination of hypertension and diabetes.',
          confidence: 0.92
        },
        {
          type: 'alert',
          content: 'Potential drug interaction detected between current medications. Review insulin and captopril dosage.',
          confidence: 0.78
        }
      ];
      
      setAiInsights(mockInsights);
    } catch (error) {
      console.error('Error generating AI insights:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleAIQuery = () => {
    if (aiQuery.trim()) {
      generateAIInsights(aiQuery);
    }
  };

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'diagnosis':
        return <Brain className="w-5 h-5 text-blue-500" />;
      case 'recommendation':
        return <Sparkles className="w-5 h-5 text-green-500" />;
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

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

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Patient Details: {patientData?.personalInformation.fullName}</h1>
          <p className="text-gray-500">View and manage patient information</p>
        </div>

        {/* Patient Summary Card */}
        <Card className="bg-white shadow-md">
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
                <div className="flex flex-wrap gap-2 mt-2">
                  {patientData.medicalCondition.chronicDiseases.map((disease, index) => (
                    <Badge key={index} variant="secondary">{disease}</Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {patientData.medicalCondition.currentMedications.map((medication, index) => (
                    <Badge key={index} variant="outline">{medication}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Contact</h3>
                <p className="text-gray-900">{patientData.contact.email}</p>
                <p className="text-gray-900">{patientData.contact.phoneNumber}</p>
              </div>
            </div>
          </CardContent>
        </Card>

       

        {/* Medical Records Section */}
        <Card className="bg-white shadow-md">
          <CardHeader>
            <CardTitle>Medical Records History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {patientData.medicalRecords.map((record) => (
                <div key={record.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Diagnosis</h3>
                      <p className="text-gray-600">{record.diagnosis}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{formatDate(record.date)}</p>
                      <p className="text-sm font-medium">{record.doctor.name}</p>
                    </div>
                  </div>

                  {record.treatment.medications.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Prescribed Medications</h4>
                      <div className="space-y-2">
                        {record.treatment.medications.map((medication) => (
                          <div key={medication._id} className="bg-gray-50 p-3 rounded">
                            <p className="font-medium">{medication.name}</p>
                            <p className="text-sm text-gray-600">
                              {medication.dosage} - {medication.frequency} for {medication.duration}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {record.treatment.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Recommendations</h4>
                      <ul className="list-disc list-inside text-gray-600">
                        {record.treatment.recommendations.map((recommendation, index) => (
                          <li key={index}>{recommendation}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* File Management Section */}
        <Card className="bg-white shadow-md">
          <CardHeader>
            <CardTitle>File Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search and Filter */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <Input 
                    type="text" 
                    placeholder="Search files by name..." 
                    className="w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select 
                  value={activeTab}
                  onValueChange={handleTabChange}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All File Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All File Types ({filesData?.counts.all || 0})</SelectItem>
                    <SelectItem value="images">Images ({filesData?.counts.images || 0})</SelectItem>
                    <SelectItem value="documents">Documents ({filesData?.counts.documents || 0})</SelectItem>
                    <SelectItem value="other">Other ({filesData?.counts.other || 0})</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* File Type Tabs */}
              <div className="flex gap-4 border-b">
                <button
                  className={`pb-2 px-1 ${
                    activeTab === 'all'
                      ? 'border-b-2 border-primary text-primary font-medium'
                      : 'text-gray-500'
                  }`}
                  onClick={() => handleTabChange('all')}
                >
                  All Files ({filesData?.counts.all || 0})
                </button>
                <button
                  className={`pb-2 px-1 ${
                    activeTab === 'images'
                      ? 'border-b-2 border-primary text-primary font-medium'
                      : 'text-gray-500'
                  }`}
                  onClick={() => handleTabChange('images')}
                >
                  Images ({filesData?.counts.images || 0})
                </button>
                <button
                  className={`pb-2 px-1 ${
                    activeTab === 'documents'
                      ? 'border-b-2 border-primary text-primary font-medium'
                      : 'text-gray-500'
                  }`}
                  onClick={() => handleTabChange('documents')}
                >
                  Documents ({filesData?.counts.documents || 0})
                </button>
                <button
                  className={`pb-2 px-1 ${
                    activeTab === 'other'
                      ? 'border-b-2 border-primary text-primary font-medium'
                      : 'text-gray-500'
                  }`}
                  onClick={() => handleTabChange('other')}
                >
                  Other ({filesData?.counts.other || 0})
                </button>
              </div>

              {/* Files Grid */}
              <div className="grid grid-cols-3 gap-4">
                {filteredFiles.map((file) => (
                  <div key={file.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.type)}
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-gray-500">{formatDate(new Date().toISOString())}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="opacity-0 group-hover:opacity-100"
                      onClick={() => window.open(file.url, '_blank')}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PatientDetails; 