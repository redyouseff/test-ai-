import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/types';
import Layout from '../components/layout/Layout';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { 
  FileText, Calendar, User2, Stethoscope, Activity, ClipboardList, Search, 
  Clock, MapPin, X, Pill, ScrollText, AlertCircle, Check, ArrowRight
} from 'lucide-react';
import axios from 'axios';
import { useToast } from "@/components/ui/use-toast";
import { format } from 'date-fns';
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface Doctor {
  _id: string;
  fullName: string;
  specialty: string; 
}

interface Patient {
  _id: string;
  fullName: string;
}

interface Appointment {
  _id: string;
  appointmentDate: string;
  reasonForVisit: string;
}

interface MedicalRecord {
  _id: string;
  patient: Patient;
  doctor: Doctor;
  appointment: Appointment;
  createdAt: string;
  updatedAt: string;
}

interface ListApiResponse {
  status: string;
  results: number;
  data: MedicalRecord[];
}

interface Medication {
  _id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface Treatment {
  medications: Medication[];
  recommendations: string[];
}

interface FollowUp {
  required: boolean;
  notes: string;
}

interface AppointmentReport {
  treatment: Treatment;
  followUp: FollowUp;
  diagnosis: string;
  symptoms: string[];
  completedAt: string;
}

interface DetailedAppointment extends Appointment {
  appointmentReport: AppointmentReport;
}

interface DetailedMedicalRecord extends MedicalRecord {
  treatment: Treatment;
  followUp: FollowUp;
  diagnosis: string;
  symptoms: string[];
  appointment: DetailedAppointment;
}

interface DetailedApiResponse {
  status: string;
  data: {
    medicalRecord: DetailedMedicalRecord;
  };
}

const RecordDetailsModal = ({ 
  recordId, 
  isOpen, 
  onClose 
}: { 
  recordId: string | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [detailedRecord, setDetailedRecord] = useState<DetailedMedicalRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const { token } = useSelector((state: RootState) => state.auth);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRecordDetails = async () => {
      if (!recordId) return;
      
      setLoading(true);
      try {
        const response = await axios.get<DetailedApiResponse>(
          `https://care-insight-api-9ed25d3ea3ea.herokuapp.com/api/v1/medical-records/${recordId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        if (response.data.status === "success") {
          setDetailedRecord(response.data.data.medicalRecord);
        }
      } catch (error) {
        console.error('Error fetching record details:', error);
        toast({
          title: "Error",
          description: "Failed to load record details. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecordDetails();
  }, [recordId, token, toast]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" hideCloseButton>
        <div className="sticky top-0 bg-white z-10 pb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl text-primary/70 font-medium">Medical Record Details</h2>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : detailedRecord ? (
          <div className="mt-2 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Patient</h4>
                  <p className="text-lg font-semibold text-gray-900" dir="auto">{detailedRecord.patient.fullName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Doctor</h4>
                  <p className="text-lg font-semibold text-gray-900" dir="auto">{detailedRecord.doctor.fullName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Appointment Date</h4>
                  <p className="text-lg font-semibold text-gray-900">
                    {format(new Date(detailedRecord.appointment.appointmentDate), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Created At</h4>
                  <p className="text-lg font-semibold text-gray-900">
                    {format(new Date(detailedRecord.createdAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                <div className="col-span-2">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Reason for Visit</h4>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {detailedRecord.appointment.reasonForVisit.replace(/-/g, ' ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Diagnosis & Symptoms */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Diagnosis & Symptoms</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Diagnosis</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-line" dir="auto">{detailedRecord.diagnosis}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Symptoms</h4>
                  <div className="flex flex-wrap gap-2">
                    {detailedRecord.symptoms.map((symptom, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-primary/5 text-primary rounded-full text-sm"
                        dir="auto"
                      >
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Treatment */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Treatment Plan</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Medications</h4>
                  <div className="space-y-3">
                    {detailedRecord.treatment.medications.map((medication) => (
                      <div 
                        key={medication._id}
                        className="bg-gray-50 p-4 rounded-lg space-y-2"
                      >
                        <p className="font-medium text-gray-900" dir="auto">{medication.name}</p>
                        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="text-gray-500">Dosage:</span>
                            <span className="mr-2" dir="auto"> {medication.dosage}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Frequency:</span>
                            <span className="mr-2" dir="auto"> {medication.frequency}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Duration:</span>
                            <span dir="auto"> {medication.duration}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Recommendations</h4>
                  <ul className="space-y-2">
                    {detailedRecord.treatment.recommendations.map((recommendation, index) => (
                      <li 
                        key={index}
                        className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg"
                      >
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-gray-900" dir="auto">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Follow Up */}
            {detailedRecord.followUp.required && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Follow-up Information</h3>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Follow-up Notes</h4>
                  <div className="bg-primary/5 p-4 rounded-lg">
                    <p className="text-gray-900" dir="auto">{detailedRecord.followUp.notes}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Appointment Report */}
            {detailedRecord.appointment.appointmentReport && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Report</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Report Diagnosis</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-900 whitespace-pre-line" dir="auto">
                        {detailedRecord.appointment.appointmentReport.diagnosis}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Report Symptoms</h4>
                    <div className="flex flex-wrap gap-2">
                      {detailedRecord.appointment.appointmentReport.symptoms.map((symptom, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-primary/5 text-primary rounded-full text-sm"
                          dir="auto"
                        >
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Report Medications</h4>
                    <div className="space-y-3">
                      {detailedRecord.appointment.appointmentReport.treatment.medications.map((medication) => (
                        <div 
                          key={medication._id}
                          className="bg-gray-50 p-4 rounded-lg space-y-2"
                        >
                          <p className="font-medium text-gray-900" dir="auto">{medication.name}</p>
                          <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="text-gray-500">Dosage:</span>
                              <span className="mr-2" dir="auto"> {medication.dosage}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Frequency:</span>
                              <span className="mr-2" dir="auto"> {medication.frequency}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Duration:</span>
                              <span dir="auto"> {medication.duration}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Report Recommendations</h4>
                    <ul className="space-y-2">
                      {detailedRecord.appointment.appointmentReport.treatment.recommendations.map((recommendation, index) => (
                        <li 
                          key={index}
                          className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg"
                        >
                          <Check className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="text-gray-900" dir="auto">{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {detailedRecord.appointment.appointmentReport.followUp.required && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Report Follow-up Notes</h4>
                      <div className="bg-primary/5 p-4 rounded-lg">
                        <p className="text-gray-900" dir="auto">
                          {detailedRecord.appointment.appointmentReport.followUp.notes}
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Report Completion Time</h4>
                    <p className="text-gray-900">
                      {format(new Date(detailedRecord.appointment.appointmentReport.completedAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Failed to load record details</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const MedicalRecords = () => {
  const { user: currentUser, token } = useSelector((state: RootState) => state.auth);
  const { toast } = useToast();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await axios.get<ListApiResponse>(
          'https://care-insight-api-9ed25d3ea3ea.herokuapp.com/api/v1/medical-records/my-records',
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        if (response.data.status === "success") {
          setRecords(response.data.data);
          setFilteredRecords(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching medical records:', error);
        toast({
          title: "Error",
          description: "Failed to load medical records. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchRecords();
    } else {
      setLoading(false);
      toast({
        title: "Authentication Error",
        description: "Please log in to view your medical records.",
        variant: "destructive",
      });
    }
  }, [toast, token]);

  useEffect(() => {
    const filterRecords = () => {
      const query = searchQuery.toLowerCase();
      const filtered = records.filter(record => 
        record.appointment.reasonForVisit.toLowerCase().includes(query) ||
        record.doctor.fullName.toLowerCase().includes(query) ||
        record.patient.fullName.toLowerCase().includes(query) ||
        format(new Date(record.appointment.appointmentDate), 'MMM dd, yyyy').toLowerCase().includes(query)
      );
      setFilteredRecords(filtered);
    };

    filterRecords();
  }, [searchQuery, records]);

  const handleRecordClick = (recordId: string) => {
    setSelectedRecordId(recordId);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-white to-primary/5 pb-12">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('/patterns/grid.svg')] opacity-5"></div>
        
        <div className="container mx-auto py-20 px-4 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Floating Badge */}
            <div className="inline-block animate-bounce">
              <div className="relative">
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-primary/30 to-primary-dark/30 blur-md"></div>
                <span className="relative bg-white/95 text-primary px-8 py-3 rounded-full text-sm font-medium shadow-xl border border-primary/10 flex items-center gap-3">
                  <ClipboardList className="w-5 h-5 text-primary animate-pulse" />
                  <span className="text-base">Medical History</span>
                  <Activity className="w-5 h-5 text-primary animate-pulse" />
                </span>
              </div>
            </div>

            {/* Main Title */}
            <div className="relative space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-primary via-primary-dark to-primary bg-clip-text text-transparent animate-gradient">
                  Medical
                </span>
                <br />
                <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                  Records
                </span>
              </h1>
              <div className="h-1 w-20 bg-gradient-to-r from-primary to-primary-dark rounded-full mx-auto"></div>
            </div>

            {/* Description */}
            <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-light">
              Access and manage your complete medical history
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-12 mt-16 max-w-2xl mx-auto">
              <div className="text-center group hover:scale-105 transition-transform duration-300 cursor-pointer bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg shadow-primary/5">
                <div className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent mb-2 group-hover:animate-pulse">
                  {records.length}
                </div>
                <div className="text-gray-600 font-medium">Total Records</div>
              </div>
              <div className="text-center group hover:scale-105 transition-transform duration-300 cursor-pointer bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg shadow-primary/5">
                <div className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent mb-2 group-hover:animate-pulse">
                  {new Set(records.map(record => record.doctor._id)).size}
                </div>
                <div className="text-gray-600 font-medium">Doctors</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Records Section */}
      <div className="container mx-auto py-16 px-4">
        <div className="flex flex-col space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-10 w-1.5 bg-gradient-to-b from-primary to-primary-dark rounded-full"></div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Your Records</h2>
              <p className="text-gray-500 text-lg mt-1">View your medical records history</p>
            </div>
          </div>

          {/* Search Field */}
          <div className="relative max-w-xl">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search by reason, doctor, patient, or date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-6 text-lg bg-white/50 backdrop-blur-sm border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 placeholder:text-gray-400"
            />
            {searchQuery && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                {filteredRecords.length} results
              </div>
            )}
          </div>

          {/* Records Grid */}
          <div className="grid gap-6">
            {filteredRecords.map((record) => (
              <Card 
                key={record._id} 
                className="group hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 bg-white"
                onClick={() => handleRecordClick(record._id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <CardTitle className="text-xl text-gray-900 group-hover:text-primary transition-colors">
                          {record.appointment.reasonForVisit.charAt(0).toUpperCase() + 
                           record.appointment.reasonForVisit.slice(1).replace(/-/g, ' ')}
                        </CardTitle>
                        <span className="text-sm text-gray-500">
                          {format(new Date(record.appointment.appointmentDate), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 text-gray-600">
                        <div className="flex items-center gap-2">
                          <User2 className="h-4 w-4 text-primary/70" />
                          <span>{record.patient.fullName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Stethoscope className="h-4 w-4 text-primary/70" />
                          <span>{record.doctor.fullName}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredRecords.length === 0 && (
              <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-2xl border border-dashed border-gray-200">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <FileText className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {searchQuery ? 'No Results Found' : 'No Medical Records'}
                </h3>
                <p className="text-gray-500 text-lg max-w-md mx-auto">
                  {searchQuery 
                    ? 'Try adjusting your search terms or clearing the search field.'
                    : 'You don\'t have any medical records yet. Your records will appear here once they are created.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <RecordDetailsModal
        recordId={selectedRecordId}
        isOpen={!!selectedRecordId}
        onClose={() => setSelectedRecordId(null)}
      />
    </Layout>
  );
};

export default MedicalRecords;
