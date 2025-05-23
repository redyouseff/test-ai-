import { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { User, PatientProfile, DoctorProfile } from "../types";

// Mock data until we have a backend
import { mockPatients, mockDoctors } from "../data/mockData";

interface AuthContextType {
  currentUser: User | PatientProfile | DoctorProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  register: (userData: Partial<PatientProfile | DoctorProfile>, password: string) => Promise<User | null>;
  logout: () => void;
  updateUserProfile: (userData: Partial<PatientProfile | DoctorProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | PatientProfile | DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    setLoading(true);
    try {
      // Mock login logic with our mock data
      const foundPatient = mockPatients.find(patient => patient.email === email);
      const foundDoctor = mockDoctors.find(doctor => doctor.email === email);
      const user = foundPatient || foundDoctor || null;
      
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        return user;
      }
      return null;
    } catch (error) {
      console.error("Login error:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    userData: Partial<PatientProfile | DoctorProfile>,
    password: string
  ): Promise<User | null> => {
    setLoading(true);
    try {
      // Mock registration
      const newUser = {
        id: `user-${Date.now()}`,
        ...userData,
      } as User;
      
      setCurrentUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    } catch (error) {
      console.error("Registration error:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
  };

  const updateUserProfile = async (userData: Partial<PatientProfile | DoctorProfile>): Promise<void> => {
    if (!currentUser) return;

    const updatedUser = {
      ...currentUser,
      ...userData,
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
