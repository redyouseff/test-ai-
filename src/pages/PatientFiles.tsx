
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { mockPatients, mockDiagnosticFiles } from '@/data/mockData';
import { PatientProfile, DiagnosticFile } from '@/types';
import { Input } from '@/components/ui/input';
import { Calendar, Download, FileText, Filter, Search } from 'lucide-react';

const PatientFiles = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const { currentUser } = useAuth();
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [files, setFiles] = useState<DiagnosticFile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFiles, setFilteredFiles] = useState<DiagnosticFile[]>([]);
  const [fileTypeFilter, setFileTypeFilter] = useState<string>('all');

  useEffect(() => {
    if (!patientId) return;

    // Find patient
    const foundPatient = mockPatients.find(p => p.id === patientId);
    if (foundPatient) {
      setPatient(foundPatient);
    }

    // Get files for this patient
    const patientFiles = mockDiagnosticFiles.filter(file => file.patientId === patientId);
    setFiles(patientFiles);
    setFilteredFiles(patientFiles);
  }, [patientId]);

  // Filter files based on search term and file type
  useEffect(() => {
    let result = files;

    if (searchTerm) {
      result = result.filter(file => 
        file.fileName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (fileTypeFilter !== 'all') {
      result = result.filter(file => file.fileType.startsWith(fileTypeFilter));
    }

    setFilteredFiles(result);
  }, [searchTerm, fileTypeFilter, files]);

  // Group files by type for the different tabs
  const imageFiles = filteredFiles.filter(file => file.fileType.startsWith('image/'));
  const documentFiles = filteredFiles.filter(file => 
    file.fileType.includes('pdf') || 
    file.fileType.includes('doc') || 
    file.fileType.includes('txt'));
  const otherFiles = filteredFiles.filter(file => 
    !file.fileType.startsWith('image/') && 
    !file.fileType.includes('pdf') && 
    !file.fileType.includes('doc') && 
    !file.fileType.includes('txt'));

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get file type icon
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return '🖼️';
    } else if (fileType.includes('pdf')) {
      return '📄';
    } else if (fileType.includes('doc')) {
      return '📝';
    } else {
      return '📁';
    }
  };

  if (currentUser?.role !== 'doctor') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p>You don't have permission to view this page.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!patient) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p>Patient not found.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Patient Files: {patient.name}
          </h1>
          <p className="text-gray-600">
            View and manage diagnostic files for this patient
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Patient Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Personal Information</h3>
                <p className="mt-1">{patient.age} years old, {patient.gender}</p>
                <p>{patient.bloodType} blood type</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Medical Condition</h3>
                <p className="mt-1">{patient.medicalCondition || 'No conditions recorded'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Contact</h3>
                <p className="mt-1">{patient.email}</p>
                <p>{patient.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search files by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <select 
                className="bg-transparent border-none outline-none"
                value={fileTypeFilter}
                onChange={(e) => setFileTypeFilter(e.target.value)}
              >
                <option value="all">All File Types</option>
                <option value="image/">Images</option>
                <option value="application/pdf">PDF Documents</option>
                <option value="application/">Other Documents</option>
              </select>
            </Button>
            <Button variant="outline">Request New Files</Button>
            <Button>Upload Files</Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Files ({filteredFiles.length})</TabsTrigger>
            <TabsTrigger value="images">Images ({imageFiles.length})</TabsTrigger>
            <TabsTrigger value="documents">Documents ({documentFiles.length})</TabsTrigger>
            <TabsTrigger value="other">Other ({otherFiles.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            <FileGrid files={filteredFiles} formatDate={formatDate} getFileIcon={getFileIcon} />
          </TabsContent>
          
          <TabsContent value="images" className="space-y-4">
            <FileGrid files={imageFiles} formatDate={formatDate} getFileIcon={getFileIcon} />
          </TabsContent>
          
          <TabsContent value="documents" className="space-y-4">
            <FileGrid files={documentFiles} formatDate={formatDate} getFileIcon={getFileIcon} />
          </TabsContent>
          
          <TabsContent value="other" className="space-y-4">
            <FileGrid files={otherFiles} formatDate={formatDate} getFileIcon={getFileIcon} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

// File grid component
interface FileGridProps {
  files: DiagnosticFile[];
  formatDate: (dateString: string) => string;
  getFileIcon: (fileType: string) => string;
}

const FileGrid = ({ files, formatDate, getFileIcon }: FileGridProps) => {
  if (files.length === 0) {
    return (
      <div className="text-center py-10">
        <FileText className="h-10 w-10 mx-auto text-gray-400" />
        <p className="mt-2 text-gray-600">No files found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {files.map((file) => (
        <Card key={file.id} className="overflow-hidden">
          <CardContent className="p-0">
            {file.fileType.startsWith('image/') && (
              <div className="w-full h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                <img 
                  src={file.fileUrl} 
                  alt={file.fileName} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">
                    {getFileIcon(file.fileType)}
                  </span>
                  <div>
                    <h4 className="font-medium">{file.fileName}</h4>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(file.uploadDate)}
                    </div>
                  </div>
                </div>
                
                <Button size="icon" variant="ghost">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PatientFiles;
