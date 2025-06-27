import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Image,
  File,
  Download,
  Brain,
  Sparkles,
  AlertCircle,
  User,
  Phone,
  Mail,
  Calendar,
  Activity,
  Search,
  PlusCircle,
} from "lucide-react";
import api from "../redux/api";

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

const PatientDetails = () => {
  const { patientId } = useParams();
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [filesData, setFilesData] = useState<FilesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchFiles = async (filterBy: string = "all") => {
    try {
      const url =
        filterBy === "all"
          ? `/api/v1/users/patients/${patientId}/files`
          : `/api/v1/users/patients/${patientId}/files?filterBy=${filterBy}`;

      const response = await api.get(url);
      setFilesData(response.data.data);
      setActiveTab(filterBy);
    } catch (err) {
      setError("Failed to fetch files");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientResponse] = await Promise.all([
          api.get(`/api/v1/users/patients/${patientId}`),
          fetchFiles("all"),
        ]);

        setPatientData(patientResponse.data.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch data");
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId]);

  const handleTabChange = (tab: string) => {
    fetchFiles(tab);
  };

  const filteredFiles =
    filesData?.files.filter((file) =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const getFileIcon = (fileType: string) => {
    if (fileType === "image")
      return <Image className="w-6 h-6 text-gray-500" />;
    if (fileType === "document")
      return <FileText className="w-6 h-6 text-gray-500" />;
    return <File className="w-6 h-6 text-gray-500" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Add download function
  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      // You can add a toast notification here to show error
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !patientData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-xl font-semibold text-red-500">
              {error || "Patient data not found"}
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {patientData.personalInformation.fullName}
                </h1>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{patientData.personalInformation.age} years</span>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {patientData.personalInformation.gender}
                  </Badge>
                  <Badge variant="secondary">
                    Blood Type: {patientData.personalInformation.bloodType}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 text-gray-500">
                <Mail className="w-4 h-4" />
                <span>{patientData.contact.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Phone className="w-4 h-4" />
                <span>{patientData.contact.phoneNumber}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white border-b rounded-none w-full justify-start h-12 p-0 space-x-8">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="records"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12"
            >
              Medical Records
            </TabsTrigger>
            <TabsTrigger
              value="files"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12"
            >
              Files & Documents
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Medical Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Current Medical Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        Current Condition
                      </h3>
                      <p className="text-gray-900">
                        {patientData.medicalCondition.currentCondition}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">
                        Chronic Diseases
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {patientData.medicalCondition.chronicDiseases.map(
                          (disease, index) => (
                            <Badge key={index} variant="secondary">
                              {disease}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Current Medications */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Current Medications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {patientData.medicalCondition.currentMedications.map(
                      (medication, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-gray-900">{medication}</p>
                        </div>
                      )
                    )}
                    {patientData.medicalCondition.currentMedications.length ===
                      0 && (
                      <p className="text-gray-500 text-center py-4">
                        No current medications
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Medical Records Tab */}
          <TabsContent value="records" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Medical Records History</h2>
            </div>
            <div className="space-y-4">
              {patientData.medicalRecords.map((record) => (
                <Card key={record.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">
                          {record.diagnosis}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          Dr. {record.doctor.name} - {record.doctor.specialty}
                        </p>
                      </div>
                      <Badge variant="outline">{formatDate(record.date)}</Badge>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">
                          Medications
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {record.treatment.medications.map((medication) => (
                            <div
                              key={medication._id}
                              className="p-3 bg-gray-50 rounded-lg"
                            >
                              <p className="font-medium">{medication.name}</p>
                              <p className="text-sm text-gray-500">
                                {medication.dosage} - {medication.frequency}
                              </p>
                              <p className="text-sm text-gray-500">
                                Duration: {medication.duration}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">
                          Recommendations
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                          {record.treatment.recommendations.map(
                            (rec, index) => (
                              <li key={index}>{rec}</li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-6">
            <div className="flex justify-between items-center gap-4 mb-6">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleTabChange("all")}
                >
                  All Files ({filesData?.counts.all || 0})
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleTabChange("images")}
                >
                  Images ({filesData?.counts.images || 0})
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleTabChange("documents")}
                >
                  Documents ({filesData?.counts.documents || 0})
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFiles.map((file) => (
                <Card
                  key={file.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        {getFileIcon(file.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-sm text-gray-500 capitalize">
                          {file.type}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(file.url, file.name)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default PatientDetails;
