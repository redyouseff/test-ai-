export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  _id?: string;
}

export interface AppointmentReport {
  treatment: {
    medications: Medication[];
    recommendations: string[];
  };
  followUp: {
    required: boolean;
    notes?: string;
  };
  diagnosis: string;
  symptoms: string[];
  completedAt: string;
}

export interface Doctor {
  _id: string;
  fullName: string;
}

export interface Patient {
  _id: string;
  fullName: string;
}

export interface UploadedFile {
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadDate: string;
  _id: string;
}

export interface Appointment {
  _id: string;
  doctor: Doctor;
  patient: Patient;
  appointmentDate: string;
  reasonForVisit: string;
  notes: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  uploadedFiles: UploadedFile[];
  appointmentReport?: AppointmentReport;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  status: string;
  results: number;
  data: {
    appointments: T[];
  };
} 