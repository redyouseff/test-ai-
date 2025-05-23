
import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, ChevronRight, Download } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { mockMedicalRecords, mockDoctors } from '@/data/mockData';
import { MedicalRecord, DiagnosisResult, DiagnosticFile } from '@/types';

const MedicalRecords = () => {
  const { currentUser } = useAuth();
  const [activeRecord, setActiveRecord] = useState<MedicalRecord | null>(null);
  const [userRecords, setUserRecords] = useState<MedicalRecord[]>([]);

  useEffect(() => {
    if (!currentUser) return;

    // Filter records for the current user
    if (currentUser.role === 'patient') {
      const patientRecords = mockMedicalRecords.filter(record => 
        record.patientId === currentUser.id
      );
      setUserRecords(patientRecords);
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p>Please log in to view your medical records</p>
        </div>
      </DashboardLayout>
    );
  }

  if (currentUser.role !== 'patient') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p>This page is only available for patients</p>
        </div>
      </DashboardLayout>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  const getDoctorName = (doctorId: string) => {
    const doctor = mockDoctors.find(doc => doc.id === doctorId);
    return doctor ? doctor.name : 'Unknown Doctor';
  };

  const getSpecialtyFromDoctorId = (doctorId: string) => {
    const doctor = mockDoctors.find(doc => doc.id === doctorId);
    if (!doctor) return 'Specialist';
    
    return doctor.specialty.replace('-', ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ') + ' Specialist';
  };

  const getFileTypeIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return '🖼️';
    } else if (fileType === 'application/pdf') {
      return '📄';
    } else {
      return '📁';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
          <p className="text-gray-600">
            View your diagnostic results, treatment plans, and medical files
          </p>
        </div>

        {activeRecord ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                className="flex items-center" 
                onClick={() => setActiveRecord(null)}
              >
                ← Back to all records
              </Button>
              
              <div className="text-sm text-gray-500">
                Record ID: {activeRecord.id}
              </div>
            </div>
            
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Medical Record Summary</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(activeRecord.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{getDoctorName(activeRecord.doctorId)}</p>
                    <p className="text-sm text-gray-500">{getSpecialtyFromDoctorId(activeRecord.doctorId)}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Appointment Summary</h3>
                    <p className="text-gray-700 text-sm">{activeRecord.appointmentSummary}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Treatment Notes</h3>
                    <p className="text-gray-700 text-sm">{activeRecord.treatmentNotes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Tabs defaultValue="diagnosis" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
                <TabsTrigger value="files">Medical Files</TabsTrigger>
              </TabsList>
              
              <TabsContent value="diagnosis" className="space-y-4">
                {activeRecord.diagnoses.map((diagnosis: DiagnosisResult) => (
                  <Card key={diagnosis.id} className="overflow-hidden">
                    <div className={`h-2 ${diagnosis.predictionScore && diagnosis.predictionScore > 0.7 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium text-lg">{diagnosis.result}</h3>
                          <div className="flex items-center mt-1">
                            <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-500">
                              {formatDate(diagnosis.date)}
                            </span>
                          </div>
                        </div>
                        
                        {diagnosis.predictionScore && (
                          <div>
                            <div className="flex justify-between items-center text-sm mb-1">
                              <span>AI Confidence</span>
                              <span className="font-medium">{Math.round(diagnosis.predictionScore * 100)}%</span>
                            </div>
                            <Progress value={diagnosis.predictionScore * 100} className="h-2" />
                          </div>
                        )}
                        
                        {diagnosis.treatmentPlan && (
                          <div>
                            <h4 className="font-medium">Treatment Plan</h4>
                            <p className="text-sm text-gray-700 mt-1">{diagnosis.treatmentPlan}</p>
                          </div>
                        )}
                        
                        {diagnosis.followUpDate && (
                          <div className="flex items-center p-3 bg-primary-light bg-opacity-20 rounded">
                            <Calendar className="h-5 w-5 text-primary mr-2" />
                            <div>
                              <p className="text-sm font-medium">Follow-up Appointment</p>
                              <p className="text-sm text-gray-600">{formatDate(diagnosis.followUpDate)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
              
              <TabsContent value="files" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeRecord.files.map((file: DiagnosticFile) => (
                    <Card key={file.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        {file.fileType.startsWith('image/') && (
                          <div 
                            className="w-full h-40 bg-gray-100 flex items-center justify-center overflow-hidden"
                          >
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
                                {getFileTypeIcon(file.fileType)}
                              </span>
                              <div>
                                <h4 className="font-medium">{file.fileName}</h4>
                                <p className="text-xs text-gray-500">{formatDate(file.uploadDate)}</p>
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
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Medical Records</CardTitle>
              </CardHeader>
              <CardContent>
                {userRecords.length > 0 ? (
                  <div className="space-y-2">
                    {userRecords.map((record) => (
                      <div
                        key={record.id}
                        onClick={() => setActiveRecord(record)}
                        className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg cursor-pointer border"
                      >
                        <div className="flex items-center">
                          <FileText className="h-10 w-10 text-primary p-2 bg-primary-light rounded mr-3" />
                          <div>
                            <div className="font-medium">{record.diagnoses[0]?.result || 'Medical Record'}</div>
                            <div className="text-sm text-gray-500">
                              {getDoctorName(record.doctorId)} • {formatDate(record.createdAt)}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <FileText className="h-10 w-10 mx-auto text-gray-400" />
                    <p className="mt-2 text-gray-600">No medical records found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MedicalRecords;
