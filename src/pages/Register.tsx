import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Layout from '../components/layout/Layout';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '../types';
import { Loader2 } from 'lucide-react';
import { AxiosError } from 'axios';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const patientSchema = z.object({
  fullName: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phoneNumber: z.string().min(10, {
    message: "Phone number must be at least 10 digits.",
  }),
  gender: z.enum(["male", "female", "other"]),
  age: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
    message: "Age must be a positive number.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  confirmPassword: z.string(),
  height: z.string().optional(),
  weight: z.string().optional(),
  bloodType: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).optional(),
  medicalCondition: z.string().optional(),
  chronicDiseases: z.string().optional(),
  currentMedications: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const doctorSchema = z.object({
  fullName: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phoneNumber: z.string().min(10, {
    message: "Phone number must be at least 10 digits.",
  }),
  gender: z.enum(["male", "female", "other"]),
  specialtyId: z.string().min(1, {
    message: "Please select a specialty.",
  }),
  clinicLocation: z.string().min(2, {
    message: "Clinic location must be at least 2 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  confirmPassword: z.string(),
  certifications: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PatientFormValues = z.infer<typeof patientSchema>;
type DoctorFormValues = z.infer<typeof doctorSchema>;

// Add interface for specialty
interface Specialty {
  _id: string;
  name: string;
  description: string;
}

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [activeRole, setActiveRole] = useState<UserRole>("patient");
  const [loading, setLoading] = useState(false);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(false);
  
  // Fetch specialties when component mounts
  useEffect(() => {
    const fetchSpecialties = async () => {
      setLoadingSpecialties(true);
      try {
        const response = await axios.get('https://care-insight-api-9ed25d3ea3ea.herokuapp.com/api/v1/specialties');
        console.log('Specialties response:', response.data);
        if (response.data.data) {
          setSpecialties(response.data.data);
        }
      } catch (error) {
        const err = error as AxiosError;
        console.error('Error fetching specialties:', err);
        toast({
          title: "Error",
          description: "Failed to load specialties. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setLoadingSpecialties(false);
      }
    };

    fetchSpecialties();
  }, [toast]);

  // Add state for doctor work hours
  const [workHours, setWorkHours] = useState<{
    [key: string]: { enabled: boolean, start: string, end: string }
  }>({
    Monday: { enabled: false, start: "09:00", end: "17:00" },
    Tuesday: { enabled: false, start: "09:00", end: "17:00" },
    Wednesday: { enabled: false, start: "09:00", end: "17:00" },
    Thursday: { enabled: false, start: "09:00", end: "17:00" },
    Friday: { enabled: false, start: "09:00", end: "17:00" },
    Saturday: { enabled: false, start: "09:00", end: "17:00" },
    Sunday: { enabled: false, start: "09:00", end: "17:00" },
  });

  const patientForm = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      gender: "male",
      age: "",
      password: "",
      confirmPassword: "",
      height: "",
      weight: "",
      bloodType: undefined,
      medicalCondition: "",
      chronicDiseases: "",
      currentMedications: "",
    },
  });

  const doctorForm = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      gender: "male",
      specialtyId: "",
      clinicLocation: "",
      password: "",
      confirmPassword: "",
      certifications: "",
    },
  });

  const onPatientSubmit = async (values: PatientFormValues) => {
    setLoading(true);
    const userData = {
      fullName: values.fullName,
      email: values.email,
      phoneNumber: values.phoneNumber,
      gender: values.gender,
      password: values.password,
      age: parseInt(values.age),
      height: values.height ? parseInt(values.height) : undefined,
      weight: values.weight ? parseInt(values.weight) : undefined,
      bloodType: values.bloodType,
      medicalCondition: values.medicalCondition,
      chronicDiseases: values.chronicDiseases ? values.chronicDiseases.split(',').map(item => item.trim()) : [],
      currentMedications: values.currentMedications ? values.currentMedications.split(',').map(item => item.trim()) : []
    };

    try {
      console.log('Sending patient registration request:', userData);
      const response = await axios.post(
        'https://care-insight-api-9ed25d3ea3ea.herokuapp.com/api/v1/auth/register', 
        userData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: true
        }
      );
      console.log('Patient registration response:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        if (dispatch) {
          dispatch({ type: 'SET_USER', payload: response.data.user });
        }
      }
      
      toast({
        title: "Registration successful",
        description: "Your patient account has been created.",
      });
      navigate('/dashboard');
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.error('Patient registration error:', err);
      console.error('Error response:', err.response?.data);
      const errorMessage = err.response?.data?.message || 
                         (err.response?.data as { error?: string })?.error || 
                         err.message || 
                         "There was an error creating your account. Please try again.";
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onDoctorSubmit = async (values: DoctorFormValues) => {
    setLoading(true);
    
    // Format working hours from the workHours state
    const workingHours = Object.entries(workHours)
      .filter(([_, value]) => value.enabled)
      .map(([day, hours]) => ({
        day,
        from: hours.start,
        to: hours.end
      }));

    const userData = {
      fullName: values.fullName,
      email: values.email,
      phoneNumber: values.phoneNumber,
      gender: values.gender,
      password: values.password,
      specialtyId: values.specialtyId,
      clinicLocation: values.clinicLocation,
      certifications: values.certifications ? values.certifications.split(',').map(cert => cert.trim()) : [],
      workingHours
    };

    try {
      console.log('Sending doctor registration request:', userData);
      const response = await axios.post(
        'https://care-insight-api-9ed25d3ea3ea.herokuapp.com/api/v1/auth/registerDoctor', 
        userData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: true
        }
      );
      console.log('Doctor registration response:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        if (dispatch) {
          dispatch({ type: 'SET_USER', payload: response.data.user });
        }
      }
      
      toast({
        title: "Registration successful",
        description: "Your doctor account has been created.",
      });
      navigate('/dashboard');
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.error('Doctor registration error:', err);
      console.error('Error response:', err.response?.data);
      const errorMessage = err.response?.data?.message || 
                         (err.response?.data as { error?: string })?.error || 
                         err.message || 
                         "There was an error creating your account. Please try again.";
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWorkHoursChange = (day: string, field: 'enabled' | 'start' | 'end', value: boolean | string) => {
    setWorkHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  return (
    <Layout>
      <div className="py-12 px-4">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Create Your Account</h1>
            <p className="text-gray-600 mt-2">
              Join CareInsight as a patient or healthcare provider
            </p>
          </div>

          <Tabs 
            defaultValue="patient" 
            className="w-full"
            onValueChange={(value) => setActiveRole(value as UserRole)}
          >
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="patient">Register as Patient</TabsTrigger>
              <TabsTrigger value="doctor">Register as Doctor</TabsTrigger>
            </TabsList>

            <TabsContent value="patient">
              <Form {...patientForm}>
                <form onSubmit={patientForm.handleSubmit(onPatientSubmit)} className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={patientForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={patientForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="yourname@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={patientForm.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+201234567890" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={patientForm.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={patientForm.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Medical Information Section */}
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Medical Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={patientForm.control}
                        name="height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Height (cm)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="175" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={patientForm.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight (kg)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="70" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={patientForm.control}
                        name="bloodType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Blood Type</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select blood type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="A+">A+</SelectItem>
                                <SelectItem value="A-">A-</SelectItem>
                                <SelectItem value="B+">B+</SelectItem>
                                <SelectItem value="B-">B-</SelectItem>
                                <SelectItem value="AB+">AB+</SelectItem>
                                <SelectItem value="AB-">AB-</SelectItem>
                                <SelectItem value="O+">O+</SelectItem>
                                <SelectItem value="O-">O-</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="mt-6 space-y-6">
                      <FormField
                        control={patientForm.control}
                        name="medicalCondition"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Medical Condition</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe your current medical condition..." 
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={patientForm.control}
                        name="chronicDiseases"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Chronic Diseases</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="List any chronic diseases, separated by commas..." 
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Enter any chronic diseases, separated by commas
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={patientForm.control}
                        name="currentMedications"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Medications</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="List any current medications, separated by commas..." 
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Enter any medications you are currently taking, separated by commas
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={patientForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormDescription>
                            At least 6 characters
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={patientForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="mt-6">
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary-dark text-white" 
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Register as Patient'
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="doctor">
              <Form {...doctorForm}>
                <form onSubmit={doctorForm.handleSubmit(onDoctorSubmit)} className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Professional Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={doctorForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Dr. Jane Smith" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={doctorForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="doctor@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={doctorForm.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+201234567890" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={doctorForm.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={doctorForm.control}
                        name="specialtyId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cancer Specialty</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              disabled={loadingSpecialties}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={loadingSpecialties ? "Loading specialties..." : "Select specialty"} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {specialties.map((specialty) => (
                                  <SelectItem 
                                    key={specialty._id} 
                                    value={specialty._id}
                                  >
                                    {specialty.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={doctorForm.control}
                        name="clinicLocation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Clinic Location</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Medical St, City" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold mb-4">Certifications & Availability</h2>
                    <FormField
                      control={doctorForm.control}
                      name="certifications"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Professional Certifications</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="List your certifications, separated by commas..." 
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter your professional certifications, separated by commas
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Working Hours Section */}
                    {activeRole === 'doctor' && (
                      <div className="mt-6">
                        <h3 className="text-md font-medium mb-4">Working Hours</h3>
                        <div className="space-y-4">
                          {Object.entries(workHours).map(([day, hours]) => (
                            <div key={day} className="flex flex-col md:flex-row gap-4 p-3 border rounded-md">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`day-${day}`}
                                  checked={hours.enabled}
                                  onChange={(e) => handleWorkHoursChange(day, 'enabled', e.target.checked)}
                                  className="mr-2 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label htmlFor={`day-${day}`} className="w-24">{day}</label>
                              </div>
                              
                              <div className="flex flex-1 gap-4 items-center">
                                <div className="flex-1">
                                  <label htmlFor={`start-${day}`} className="text-sm text-muted-foreground">Start</label>
                                  <Input
                                    id={`start-${day}`}
                                    type="time"
                                    value={hours.start}
                                    onChange={(e) => handleWorkHoursChange(day, 'start', e.target.value)}
                                    disabled={!hours.enabled}
                                    className="mt-1"
                                  />
                                </div>
                                <div className="flex-1">
                                  <label htmlFor={`end-${day}`} className="text-sm text-muted-foreground">End</label>
                                  <Input
                                    id={`end-${day}`}
                                    type="time"
                                    value={hours.end}
                                    onChange={(e) => handleWorkHoursChange(day, 'end', e.target.value)}
                                    disabled={!hours.enabled}
                                    className="mt-1"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={doctorForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormDescription>
                            At least 6 characters
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={doctorForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="mt-6">
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary-dark text-white" 
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Register as Doctor'
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>
          </Tabs>

          <div className="text-center mt-6">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Register;
