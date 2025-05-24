export type UserRole = 'patient' | 'doctor';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  profileImage?: string;
}

export interface PatientProfile extends User {
  height?: number;
  weight?: number;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  chronicDiseases?: string[];
  medications?: string[];
  medicalCondition?: string;
  profession?: string;
  role: 'patient';
}

export interface DoctorProfile extends User {
  specialty: string;
  certifications: string[];
  workPlace: string;
  bio?: string;
  experience: number; // in years - making this required
  rating?: number;
  reviews?: Review[]; // Reviews property
  availableDays?: string[];
  availableHours?: {
    day: string;
    hours: { start: string; end: string }[];
  }[];
  role: 'doctor';
}

export interface Specialty {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface Appointment {
  _id: string;
  doctor: {
    _id: string;
    fullName?: string;
    name?: string;
  };
  patient: {
    _id: string;
    fullName?: string;
    name?: string;
  };
  appointmentDate: string;
  reasonForVisit: string;
  notes?: string;
  status: 'pending' | 'completed' | 'cancelled';
  uploadedFiles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DiagnosticFile {
  id: string;
  patientId: string;
  appointmentId: string;
  fileUrl: string;
  fileName: string;
  uploadDate: string; // ISO string
  fileType: string;
}

export interface Laboratory {
  id: string;
  name: string;
  address: string;
  phone: string;
  services: string[];
  openHours: {
    day: string;
    open: string;
    close: string;
  }[];
}

export interface Message {
  id: string;
  senderId: string; // User ID or 'ai-bot' for AI messages
  receiverId: string;
  content: string;
  timestamp: string; // ISO string
  read: boolean;
  appointmentId?: string;
  attachments?: DiagnosticFile[];
}

export interface DiagnosisResult {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  date: string; // ISO string
  result: string;
  predictionScore?: number;
  treatmentPlan?: string;
  followUpDate?: string; // ISO string
  reviewedByDoctor: boolean;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  diagnoses: DiagnosisResult[];
  files: DiagnosticFile[];
  treatmentNotes?: string;
  appointmentSummary?: string;
}

export interface LabBooking {
  id: string;
  patientId: string;
  laboratoryId: string;
  serviceId: string;
  date: string; // ISO string
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface DoctorSchedule {
  doctorId: string;
  availableDays: string[];
  availableHours: {
    day: string;
    hours: { start: string; end: string }[];
  }[];
}

export interface Review {
  id: string;
  doctorId: string;
  patientId: string;
  patientName: string;
  rating: number;
  comment: string;
  date: string;
}
