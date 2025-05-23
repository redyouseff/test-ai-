
import { PatientProfile, DoctorProfile, Specialty, Appointment, Laboratory, DiagnosticFile, MedicalRecord, DiagnosisResult } from "../types";

// Mock Patients
export const mockPatients: PatientProfile[] = [
  {
    id: "patient1",
    name: "John Doe",
    email: "patient@example.com", // Use this to login as patient
    phone: "123-456-7890",
    role: "patient",
    age: 35,
    gender: "male",
    height: 175, // cm
    weight: 75, // kg
    maritalStatus: "married",
    bloodType: "O+",
    chronicDiseases: ["Hypertension"],
    medications: ["Lisinopril"],
    medicalCondition: "Mild hypertension controlled with medication",
    profession: "Software Developer",
    profileImage: "/placeholder.svg",
  },
  {
    id: "patient2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "987-654-3210",
    role: "patient",
    age: 28,
    gender: "female",
    height: 165, // cm
    weight: 60, // kg
    maritalStatus: "single",
    bloodType: "A+",
    chronicDiseases: [],
    medications: [],
    medicalCondition: "No chronic conditions",
    profession: "Teacher",
    profileImage: "/placeholder.svg",
  },
];

// Mock Doctors
export const mockDoctors: DoctorProfile[] = [
  {
    id: "doctor1",
    name: "Dr. Sarah Johnson",
    email: "doctor@example.com", // Use this to login as doctor
    phone: "555-123-4567",
    role: "doctor",
    specialty: "brain-cancer",
    certifications: ["Board Certified Neurologist", "Brain Cancer Specialist"],
    workPlace: "Memorial Cancer Center",
    bio: "Dr. Johnson is a leading neurologist specializing in brain cancer treatment with 15 years of experience.",
    experience: 15,
    rating: 4.9,
    availableDays: ["Monday", "Tuesday", "Thursday", "Friday"],
    availableHours: [
      { 
        day: "Monday", 
        hours: [{ start: "09:00", end: "12:00" }, { start: "13:00", end: "17:00" }] 
      },
      { 
        day: "Tuesday", 
        hours: [{ start: "09:00", end: "14:00" }] 
      },
      { 
        day: "Thursday", 
        hours: [{ start: "10:00", end: "16:00" }] 
      },
      { 
        day: "Friday", 
        hours: [{ start: "09:00", end: "12:00" }] 
      }
    ],
    profileImage: "/placeholder.svg",
  },
  {
    id: "doctor2",
    name: "Dr. Michael Chen",
    email: "michael.chen@example.com",
    phone: "555-789-1234",
    role: "doctor",
    specialty: "skin-cancer",
    certifications: ["Board Certified Dermatologist", "Skin Cancer Specialist"],
    workPlace: "City Dermatology Clinic",
    bio: "Dr. Chen is a dermatologist focused on skin cancer detection and treatment, with particular interest in melanoma research.",
    experience: 12,
    rating: 4.7,
    availableDays: ["Monday", "Wednesday", "Friday"],
    availableHours: [
      { 
        day: "Monday", 
        hours: [{ start: "08:00", end: "16:00" }] 
      },
      { 
        day: "Wednesday", 
        hours: [{ start: "10:00", end: "18:00" }] 
      },
      { 
        day: "Friday", 
        hours: [{ start: "08:00", end: "14:00" }] 
      }
    ],
    profileImage: "/placeholder.svg",
  },
  {
    id: "doctor3",
    name: "Dr. Elizabeth Taylor",
    email: "elizabeth.taylor@example.com",
    phone: "555-456-7890",
    role: "doctor",
    specialty: "chest-cancer",
    certifications: ["Board Certified Oncologist", "Pulmonary Specialist"],
    workPlace: "University Hospital",
    bio: "Dr. Taylor specializes in chest and lung cancers with over 20 years of clinical and research experience.",
    experience: 20,
    rating: 4.8,
    availableDays: ["Tuesday", "Thursday", "Saturday"],
    availableHours: [
      { 
        day: "Tuesday", 
        hours: [{ start: "09:00", end: "17:00" }] 
      },
      { 
        day: "Thursday", 
        hours: [{ start: "09:00", end: "17:00" }] 
      },
      { 
        day: "Saturday", 
        hours: [{ start: "10:00", end: "14:00" }] 
      }
    ],
    profileImage: "/placeholder.svg",
  },
];

// Mock Specialties
export const mockSpecialties: Specialty[] = [
  {
    id: "brain-cancer",
    name: "Brain Cancer",
    description: "Diagnosis and treatment of tumors that begin in the brain or spinal cord tissues.",
    icon: "brain",
  },
  {
    id: "skin-cancer",
    name: "Skin Cancer",
    description: "Detection and treatment of abnormal growth of skin cells, including melanoma and carcinoma.",
    icon: "user",
  },
  {
    id: "chest-cancer",
    name: "Chest Cancer",
    description: "Focused on lung, pleural, and mediastinal cancers affecting the chest cavity.",
    icon: "heart",
  },
];

// Mock Appointments
export const mockAppointments: Appointment[] = [
  {
    id: "appt1",
    doctorId: "doctor1",
    patientId: "patient1",
    date: "2025-05-15T10:30:00Z",
    status: "scheduled",
    notes: "Initial consultation for recurring headaches",
    specialty: "brain-cancer",
  },
  {
    id: "appt2",
    doctorId: "doctor2",
    patientId: "patient1",
    date: "2025-05-10T14:00:00Z",
    status: "scheduled",
    notes: "Follow-up on suspicious mole",
    requiredFiles: ["Recent biopsy results"],
    specialty: "skin-cancer",
  },
  {
    id: "appt3",
    doctorId: "doctor3",
    patientId: "patient2",
    date: "2025-05-12T09:00:00Z",
    status: "scheduled",
    notes: "Annual lung screening",
    specialty: "chest-cancer",
  },
];

// Mock Laboratories
export const mockLaboratories: Laboratory[] = [
  {
    id: "lab1",
    name: "Central Diagnostic Laboratory",
    address: "123 Medical Dr., Medical City",
    phone: "555-111-2222",
    services: ["Blood Tests", "X-Ray", "MRI", "CT Scan"],
    openHours: [
      { day: "Monday", open: "08:00", close: "18:00" },
      { day: "Tuesday", open: "08:00", close: "18:00" },
      { day: "Wednesday", open: "08:00", close: "18:00" },
      { day: "Thursday", open: "08:00", close: "18:00" },
      { day: "Friday", open: "08:00", close: "16:00" },
      { day: "Saturday", open: "09:00", close: "13:00" },
      { day: "Sunday", open: "", close: "" },
    ],
  },
  {
    id: "lab2",
    name: "Advanced Imaging Center",
    address: "456 Hospital Blvd., Medical City",
    phone: "555-333-4444",
    services: ["MRI", "CT Scan", "PET Scan", "Ultrasound"],
    openHours: [
      { day: "Monday", open: "08:00", close: "20:00" },
      { day: "Tuesday", open: "08:00", close: "20:00" },
      { day: "Wednesday", open: "08:00", close: "20:00" },
      { day: "Thursday", open: "08:00", close: "20:00" },
      { day: "Friday", open: "08:00", close: "20:00" },
      { day: "Saturday", open: "09:00", close: "16:00" },
      { day: "Sunday", open: "10:00", close: "14:00" },
    ],
  },
];

// Mock Diagnostic Files
export const mockDiagnosticFiles: DiagnosticFile[] = [
  {
    id: "file1",
    patientId: "patient1",
    appointmentId: "appt1",
    fileUrl: "/placeholder.svg",
    fileName: "brain_scan.png",
    uploadDate: "2025-05-05T10:30:00Z",
    fileType: "image/png"
  },
  {
    id: "file2",
    patientId: "patient1",
    appointmentId: "appt2",
    fileUrl: "/placeholder.svg",
    fileName: "skin_biopsy.jpg",
    uploadDate: "2025-05-06T14:00:00Z",
    fileType: "image/jpeg"
  },
  {
    id: "file3",
    patientId: "patient2",
    appointmentId: "appt3",
    fileUrl: "/placeholder.svg",
    fileName: "chest_xray.jpg",
    uploadDate: "2025-05-07T09:00:00Z",
    fileType: "image/jpeg"
  },
  {
    id: "file4",
    patientId: "patient1",
    appointmentId: "appt1",
    fileUrl: "/placeholder.svg",
    fileName: "lab_results.pdf",
    uploadDate: "2025-05-08T14:30:00Z",
    fileType: "application/pdf"
  },
  {
    id: "file5",
    patientId: "patient1",
    appointmentId: "appt1",
    fileUrl: "/placeholder.svg",
    fileName: "medication_report.docx",
    uploadDate: "2025-05-09T09:15:00Z",
    fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  }
];

// Mock Diagnosis Results
export const mockDiagnosisResults: DiagnosisResult[] = [
  {
    id: "diag1",
    appointmentId: "appt1",
    patientId: "patient1",
    doctorId: "doctor1",
    date: "2025-05-15T11:30:00Z",
    result: "Early stage glioma detected in frontal lobe",
    predictionScore: 0.85,
    treatmentPlan: "Recommend surgical resection followed by targeted radiation therapy. Monitor with MRI every 3 months.",
    followUpDate: "2025-05-30T10:00:00Z",
    reviewedByDoctor: true
  },
  {
    id: "diag2",
    appointmentId: "appt2",
    patientId: "patient1",
    doctorId: "doctor2",
    date: "2025-05-10T15:00:00Z",
    result: "Benign melanocytic nevus - no evidence of malignancy",
    predictionScore: 0.92,
    treatmentPlan: "No treatment required. Continue regular skin examinations every 6 months.",
    followUpDate: "2025-11-10T14:00:00Z",
    reviewedByDoctor: true
  }
];

// Mock Medical Records
export const mockMedicalRecords: MedicalRecord[] = [
  {
    id: "record1",
    patientId: "patient1",
    doctorId: "doctor1",
    createdAt: "2025-05-15T11:45:00Z",
    updatedAt: "2025-05-15T11:45:00Z",
    diagnoses: [mockDiagnosisResults[0]],
    files: [mockDiagnosticFiles[0], mockDiagnosticFiles[3], mockDiagnosticFiles[4]],
    treatmentNotes: "Patient showing good response to initial consultation. Scheduled for further tests to confirm diagnosis.",
    appointmentSummary: "Initial consultation for recurring headaches. Brain scan shows early signs of glioma in frontal lobe. Patient to return for follow-up after additional tests."
  },
  {
    id: "record2",
    patientId: "patient1",
    doctorId: "doctor2",
    createdAt: "2025-05-10T15:15:00Z",
    updatedAt: "2025-05-10T15:15:00Z",
    diagnoses: [mockDiagnosisResults[1]],
    files: [mockDiagnosticFiles[1]],
    treatmentNotes: "Suspicious mole on upper back appears benign. Took biopsy for confirmation.",
    appointmentSummary: "Follow-up on suspicious mole. Biopsy results show benign melanocytic nevus with no signs of malignancy. Regular monitoring recommended."
  }
];

// Mock Messages
export const mockMessages = [
  {
    id: "msg1",
    senderId: "doctor1",
    receiverId: "patient1",
    content: "Hello John, how are you feeling today? Have the headaches improved since our last appointment?",
    timestamp: "2025-05-07T14:32:00Z",
    read: true,
    appointmentId: "appt1"
  },
  {
    id: "msg2",
    senderId: "patient1",
    receiverId: "doctor1",
    content: "Hello Dr. Johnson, I'm still having occasional headaches but they seem less intense. The medication is helping.",
    timestamp: "2025-05-07T15:10:00Z",
    read: true,
    appointmentId: "appt1"
  },
  {
    id: "msg3",
    senderId: "doctor2",
    receiverId: "patient1",
    content: "Don't forget to bring your previous biopsy results to our appointment next week.",
    timestamp: "2025-05-08T09:45:00Z",
    read: false,
    appointmentId: "appt2"
  }
];
