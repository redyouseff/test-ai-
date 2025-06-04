import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import AIAssistant from './pages/AIAssistant';

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Specialties from "./pages/Specialties";
import SpecialtyDetail from "./pages/SpecialtyDetail";
import BookAppointment from "./pages/BookAppointment";
import Appointments from "./pages/Appointments";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Messages from "./pages/Messages";
import Laboratories from "./pages/Laboratories";
import HealthTools from "./pages/HealthTools";
import MedicalRecords from "./pages/MedicalRecords";
import PatientFiles from "./pages/PatientFiles";
import DoctorProfile from "./pages/DoctorProfile";
import DoctorContributions from "./pages/DoctorContributions";
import NotFound from "./pages/NotFound";
import HealthyTalk from "./pages/HealthyTalk";
import HealthPostDetail from "./pages/HealthPostDetail";
import NewContribution from "./pages/NewContribution";
import AppointmentDetails from "./pages/AppointmentDetails";
import PatientDetails from "./pages/PatientDetails";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/specialties" element={<Specialties />} />
          <Route path="/specialties/:specialtyId" element={<SpecialtyDetail />} />
          <Route path="/book-appointment/:doctorId" element={<BookAppointment />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/message/:userId" element={<Messages />} />
          <Route path="/laboratories" element={<Laboratories />} />
          <Route path="/health-tools" element={<HealthTools />} />
          <Route path="/medical-records" element={<MedicalRecords />} />
          <Route path="/patient-files/:patientId" element={<PatientFiles />} />
          <Route path="/doctor/:doctorId" element={<DoctorProfile />} />
          <Route path="/doctor-contributions" element={<DoctorContributions />} />
          <Route path="/doctor-contributions/new" element={<NewContribution />} />
          <Route path="/healthy-talk" element={<HealthyTalk />} />
          <Route path="/healthy-talk/:id" element={<HealthPostDetail />} />
         
          <Route path="/appointment/:id" element={<AppointmentDetails />} />
          <Route path="/patient/:patientId" element={<PatientDetails />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
