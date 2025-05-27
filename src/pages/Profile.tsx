import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/types';
import { fetchProfile } from '../redux/actions/authActions';
import { AppDispatch } from '../redux/store';
import axios, { AxiosError } from 'axios';
import { AnyAction } from 'redux';
import { useToast } from '@/hooks/use-toast';
import { FileText, User as UserIcon, Star, StarHalf, Download, File, FileImage, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

// Components imports
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Types
interface WorkingHour {
  day: string;
  from: string;
  to: string;
}

interface ErrorResponse {
  message: string;
  data: {
    message?: string;
    [key: string]: unknown;
  };
}

interface ExtendedUser {
  _id: string;
  name: string;
  fullName: string;
  email: string;
  phone: string;
  phoneNumber: string;
  gender: string;
  role: string;
  workPlace?: string;
  experience?: number;
  bio?: string;
  age?: number;
  maritalStatus?: string;
  profession?: string;
  height?: number;
  weight?: number;
  bloodType?: string;
  medicalCondition?: string;
  medications?: string[];
  chronicDiseases: string[];
  currentMedications: string[];
  specialty: string;
  clinicLocation: string;
  certifications: string[];
  workingHours: WorkingHour[];
  availability: string[];
  medicalDocuments: string[];
  averageRating?: number;
  numberOfReviews?: number;
  profileImage?: string;
  ProfessionalBio?: string;
  YearsOfExperience?: number;
}

// Add new interface for review
interface ReviewFormData {
  rating: number;
  comment: string;
}

const Profile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const authState = useSelector((state: RootState) => state.auth);
  const user = authState.user as unknown as ExtendedUser | null;
  const { loading, error } = authState;
  const { toast } = useToast();
  
  // State declarations
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingHours, setIsEditingHours] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editedData, setEditedData] = useState<Partial<ExtendedUser>>({});
  const [editedHours, setEditedHours] = useState<WorkingHour[]>([]);
  const [newCertification, setNewCertification] = useState('');
  const [medicalDocuments, setMedicalDocuments] = useState<Array<{
    _id: string;
    fileName: string;
    fileUrl: string;
    uploadDate: string;
  }>>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newDisease, setNewDisease] = useState('');
  const [newMedication, setNewMedication] = useState('');

  // Add new state for review
  const [reviewFormData, setReviewFormData] = useState<ReviewFormData>({
    rating: 5,
    comment: ''
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);

  // Computed values
  const isDoctor = user?.role === 'doctor';

  const fetchMedicalDocuments = async () => {
    try {
      setIsLoadingDocuments(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get<{ data: typeof medicalDocuments }>(
        'https://care-insight-api-9ed25d3ea3ea.herokuapp.com/api/v1/users/getMedicalDocuments',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data?.data) {
        setMedicalDocuments(response.data.data);
      }
    } catch (error: unknown) {
      let errorMessage = "Failed to fetch medical documents.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  useEffect(() => {
    dispatch(fetchProfile() as unknown as AnyAction);
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      if (isDoctor) {
        setEditedData({
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          clinicLocation: user.clinicLocation,
          specialty: user.specialty,
          certifications: user.certifications,
          workingHours: user.workingHours,
        });
        // Only initialize working hours for doctors
        const initialHours = [
          'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
        ].map(day => {
          const existingSchedule = user.workingHours?.find(h => h.day === day);
          return existingSchedule || { day, from: '', to: '' };
        });
        setEditedHours(initialHours);
      } else {
        // For patients, initialize with all patient info
        setEditedData({
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          gender: user.gender,
          age: user.age,
          height: user.height,
          weight: user.weight,
          bloodType: user.bloodType,
          medicalCondition: user.medicalCondition,
          chronicDiseases: user.chronicDiseases || [],
          currentMedications: user.currentMedications || []
        });
      }
      fetchMedicalDocuments();
    }
  }, [user, isDoctor]);

  const handleInputChange = (name: string, value: string | string[] | number) => {
    setEditedData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddCertification = () => {
    if (newCertification.trim()) {
      setEditedData(prev => ({
        ...prev,
        certifications: [...(prev.certifications || []), newCertification.trim()]
      }));
      setNewCertification('');
    }
  };

  const handleRemoveCertification = (index: number) => {
    setEditedData(prev => ({
      ...prev,
      certifications: prev.certifications?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.patch(
        'https://care-insight-api-9ed25d3ea3ea.herokuapp.com/api/v1/users/me',
        {
          fullName: editedData.fullName,
          phoneNumber: editedData.phoneNumber,
          gender: editedData.gender,
          specialty: editedData.specialty,
          clinicLocation: editedData.clinicLocation,
          certifications: editedData.certifications,
          ProfessionalBio: editedData.ProfessionalBio,
          YearsOfExperience: editedData.YearsOfExperience
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Professional information has been updated successfully.",
          variant: "default",
          className: "bg-green-500 text-white border-none"
        });
        
        // Short delay before reloading to ensure the toast is visible
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error: unknown) {
      let errorMessage = "Failed to update profile information.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  console.log(user);

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star 
          key={`star-${i}`} 
          className="w-5 h-5 fill-yellow-400 text-yellow-400" 
        />
      );
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <StarHalf 
          key="half-star" 
          className="w-5 h-5 fill-yellow-400 text-yellow-400" 
        />
      );
    }

    // Add empty stars to make total of 5
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star 
          key={`empty-star-${i}`} 
          className="w-5 h-5 text-gray-300" 
        />
      );
    }

    return stars;
  };

  if (loading) return (
    <DashboardLayout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    </DashboardLayout>
  );
  if (error) return <div className="text-red-500">حدث خطأ أثناء جلب البيانات: {error}</div>;
  if (!user) return <div>No profile data</div>;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // يمكنك هنا إضافة منطق تحديث البروفايل عبر API أو Redux إذا توفر لاحقاً
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated successfully.",
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    // يمكنك هنا إضافة منطق تحديث البروفايل عبر API أو Redux إذا توفر لاحقاً
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated successfully.",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // يمكنك هنا إضافة منطق تحديث البروفايل عبر API أو Redux إذا توفر لاحقاً
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated successfully.",
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image size should be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('profileImage', file);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.post(
        'https://care-insight-api-9ed25d3ea3ea.herokuapp.com/api/v1/users/uploadImage', 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
          withCredentials: true
        }
      );

      if (response.status === 200) {
        dispatch({
          type: 'UPDATE_PROFILE',
          payload: {
            ...user,
            profileImage: response.data.imageUrl
          } as ExtendedUser
        });

        toast({
          title: "Success",
          description: "Profile image updated successfully",
        });

        window.location.reload();
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error: unknown) {
      let errorMessage = "Failed to upload image. Please try again.";
      
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

  const parseTime = (timeStr: string) => {
    if (!timeStr) return '';
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':');
    let hour = parseInt(hours);
    
    if (period === 'PM' && hour !== 12) {
      hour += 12;
    } else if (period === 'AM' && hour === 12) {
      hour = 0;
    }
    
    return `${hour.toString().padStart(2, '0')}:${minutes}`;
  };

  const handleHoursChange = (dayIndex: number, field: 'from' | 'to', value: string) => {
    setEditedHours(prev => {
      const newHours = [...prev];
      newHours[dayIndex] = {
        ...newHours[dayIndex],
        [field]: value
      };
      return newHours;
    });
  };

  const handleSaveHours = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Filter out days with empty schedules
      const validHours = editedHours.filter(hour => hour.from && hour.to);

      const response = await axios.patch(
        'https://care-insight-api-9ed25d3ea3ea.herokuapp.com/api/v1/users/updateWorkingHours',
        { workingHours: validHours },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Working hours have been updated successfully.",
          variant: "default",
          className: "bg-green-500 text-white border-none"
        });
        setIsEditingHours(false);
        
        // Update local state with the response data
        if (response.data?.data?.workingHours) {
          const updatedHours = [
            'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
          ].map(day => {
            const existingSchedule = response.data.data.workingHours.find((h: WorkingHour) => h.day === day);
            return existingSchedule || { day, from: '', to: '' };
          });
          setEditedHours(updatedHours);
          
          // Update the user state in Redux
          dispatch({
            type: 'UPDATE_PROFILE',
            payload: {
              ...user,
              workingHours: response.data.data.workingHours
            }
          });

          // Fetch fresh profile data to ensure everything is up to date
          dispatch(fetchProfile() as unknown as AnyAction);
        }
      }
    } catch (error) {
      console.error('Error updating working hours:', error);
      toast({
        title: "Error",
        description: "Failed to update working hours. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteHours = (dayIndex: number) => {
    setEditedHours(prev => {
      const newHours = [...prev];
      newHours[dayIndex] = {
        ...newHours[dayIndex],
        from: '',
        to: ''
      };
      return newHours;
    });
  };

  const renderPatientProfile = () => {
    if (!user || user.role !== 'patient') return null;
    
    return (
      <div className="flex">
        {/* Left Side - Profile Photo */}
        <div className="w-[300px] bg-white rounded-lg p-8">
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center mb-4 overflow-hidden">
              {user.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt={user.fullName} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <UserIcon size={48} className="text-gray-300" />
              )}
            </div>
            <h2 className="text-xl font-semibold mb-1">{user.fullName}</h2>
            <p className="text-gray-500 mb-6">Patient</p>
            <Button 
              variant="outline" 
              className="w-full border border-gray-200 rounded-md"
              onClick={() => document.getElementById('profile-image')?.click()}
            >
              Change Photo
            </Button>
            <input
              type="file"
              id="profile-image"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>
        </div>

        {/* Right Side - Information */}
        <div className="flex-1 ml-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg p-8 mb-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Personal Information</h2>
              <Button 
                variant="secondary"
                className="bg-[#7C3AED] text-white hover:bg-[#6D28D9] rounded-full px-6"
                onClick={() => setIsEditing(true)}
              >
                Edit Information
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-x-32 gap-y-6">
              <div>
                <p className="text-gray-500 text-sm">Full Name</p>
                <p className="mt-2 text-black">{user.fullName}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Email</p>
                <p className="mt-2 text-black">{user.email}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Phone</p>
                <p className="mt-2 text-black">{user.phoneNumber}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Age</p>
                <p className="mt-2 text-black">{user.age}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Gender</p>
                <p className="mt-2 text-black capitalize">{user.gender}</p>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="bg-white rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-8">Medical Information</h2>
            
            <div className="space-y-8">
              <div className="grid grid-cols-3 gap-x-32">
                <div>
                  <p className="text-gray-500 text-sm">Height</p>
                  <p className="mt-2 text-black">{user.height} cm</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Weight</p>
                  <p className="mt-2 text-black">{user.weight} kg</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Blood Type</p>
                  <p className="mt-2 text-black">{user.bloodType}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-500 text-sm">Medical Condition</p>
                <p className="mt-2 text-black">{user.medicalCondition || 'No medical conditions'}</p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">Chronic Diseases</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {user.chronicDiseases?.map((disease, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      {disease}
                    </Badge>
                  ))}
                  {(!user.chronicDiseases || user.chronicDiseases.length === 0) && (
                    <p className="text-gray-500">No chronic diseases</p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-gray-500 text-sm">Current Medications</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {user.currentMedications?.map((medication, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      {medication}
                    </Badge>
                  ))}
                  {(!user.currentMedications || user.currentMedications.length === 0) && (
                    <p className="text-gray-500">No current medications</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDoctorProfile = () => {
    if (!user || user.role !== 'doctor') return null;
    const doctor = user as ExtendedUser;
    
    return (
      <div className="flex">
        {/* Left Side - Profile Photo */}
        <div className="w-[300px] bg-white rounded-lg p-8">
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center mb-4 overflow-hidden">
              {doctor.profileImage ? (
                <img 
                  src={doctor.profileImage} 
                  alt={doctor.fullName} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <UserIcon size={48} className="text-gray-300" />
              )}
            </div>
            <h2 className="text-xl font-semibold mb-1">{doctor.fullName}</h2>
            <p className="text-gray-500 mb-6">Doctor</p>
            <Button 
              variant="outline" 
              className="w-full border border-gray-200 rounded-md"
              onClick={() => document.getElementById('profile-image')?.click()}
            >
              Change Photo
            </Button>
            <input
              type="file"
              id="profile-image"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>
        </div>

        {/* Right Side - Information */}
        <div className="flex-1 ml-6">
          {/* Professional Information */}
          <div className="bg-white rounded-lg p-8 mb-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Professional Information</h2>
              <Button 
                variant="secondary"
                className="bg-[#7C3AED] text-white hover:bg-[#6D28D9] rounded-full px-6"
                onClick={() => setIsEditing(true)}
              >
                Edit Information
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-x-32 gap-y-6">
              <div>
                <p className="text-gray-500 text-sm">Full Name</p>
                <p className="mt-2 text-black">{doctor.fullName}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Email</p>
                <p className="mt-2 text-black">{doctor.email}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Phone</p>
                <p className="mt-2 text-black">{doctor.phoneNumber}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Specialty</p>
                <p className="mt-2 text-black">{doctor.specialty}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Clinic Location</p>
                <p className="mt-2 text-black">{doctor.clinicLocation}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Rating</p>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {renderRatingStars(false)}
                  </div>
                  <span className="text-sm text-gray-500">
                    ({doctor.numberOfReviews || 0} reviews)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="bg-white rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-8">Certifications</h2>
            <div className="space-y-4">
              {doctor.certifications?.map((cert, index) => (
                <div key={index} className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  <p className="text-gray-900">{cert}</p>
                </div>
              ))}
              {(!doctor.certifications || doctor.certifications.length === 0) && (
                <p className="text-gray-500">No certifications added yet</p>
              )}
            </div>
          </div>

          {/* Working Hours */}
          <div className="bg-white rounded-lg p-8 mt-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Working Hours</h2>
              <Button 
                variant="secondary"
                className="bg-[#7C3AED] text-white hover:bg-[#6D28D9] rounded-full px-6"
                onClick={() => setIsEditingHours(true)}
              >
                Edit Hours
              </Button>
            </div>
            
            <div className="space-y-4">
              {doctor.workingHours?.map((schedule, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="font-medium w-32">{schedule.day}</span>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      {schedule.from} - {schedule.to}
                    </span>
                  </div>
                </div>
              ))}
              {(!doctor.workingHours || doctor.workingHours.length === 0) && (
                <p className="text-gray-500 text-center">No working hours set</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p>Please login to view your profile.</p>
        </div>
      </DashboardLayout>
    );
  }

  const renderCertificationsSection = () => (
    <div className="col-span-2">
      <Label className="text-sm font-medium text-gray-500 mb-2">Certifications</Label>
      {isEditing ? (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newCertification}
              onChange={(e) => setNewCertification(e.target.value)}
              placeholder="Enter new certification"
              className="flex-1"
            />
            <Button
              type="button"
              onClick={handleAddCertification}
              className="bg-primary text-white"
            >
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {editedData.certifications?.map((cert, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span>{cert}</span>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  onClick={() => handleRemoveCertification(index)}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          {user?.certifications?.map((cert, index) => (
            <div key={index} className="text-base text-gray-900 bg-gray-50 p-2 rounded">
              {cert}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const handleDocumentUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formData = new FormData();
      formData.append('medicalDocuments', file);

      const response = await axios.post(
        'https://care-insight-api-9ed25d3ea3ea.herokuapp.com/api/v1/users/uploadMedicalDocuments',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Document uploaded successfully.",
          variant: "default",
          className: "bg-green-500 text-white border-none"
        });
        fetchMedicalDocuments();
      }
    } catch (error: unknown) {
      let errorMessage = "Failed to upload document.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Add handleBrowseClick function
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  // Add helper function to get file icon
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="w-10 h-10 text-red-500" />;
      case 'doc':
      case 'docx':
        return <File className="w-10 h-10 text-blue-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <FileImage className="w-10 h-10 text-green-500" />;
      default:
        return <FileText className="w-10 h-10 text-gray-400" />;
    }
  };

  // Add a helper function to safely format dates
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Add delete handler function
  const handleDeleteDocument = async (documentId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.delete(
        `https://care-insight-api-9ed25d3ea3ea.herokuapp.com/api/v1/users/deleteMedicalDocument/${documentId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Document deleted successfully.",
          variant: "default",
          className: "bg-green-500 text-white border-none"
        });
        // Refresh the documents list
        fetchMedicalDocuments();
      }
    } catch (error) {
      let errorMessage = "Failed to delete document.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Modify the handleReviewSubmit function
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted'); // Debug log
    
    if (!reviewFormData.comment.trim()) {
      toast({
        title: "Error",
        description: "Please write a review comment",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmittingReview(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Get the doctor ID from the URL
      const pathSegments = window.location.pathname.split('/');
      const doctorId = pathSegments[pathSegments.length - 1];

      console.log('Sending review with data:', {
        doctorId,
        rating: selectedRating,
        comment: reviewFormData.comment
      });

      const response = await axios.post(
        'https://care-insight-api-9ed25d3ea3ea.herokuapp.com/api/v1/reviews',
        {
          doctorId,
          rating: selectedRating,
          comment: reviewFormData.comment
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Response:', response);

      if (response.status === 201 || response.status === 200) {
        toast({
          title: "Success",
          description: "Your review has been submitted successfully.",
          variant: "default",
          className: "bg-green-500 text-white border-none"
        });
        
        // Reset form
        setReviewFormData({ rating: 5, comment: '' });
        setSelectedRating(5);
        
        // Refresh profile data to show updated rating
        dispatch(fetchProfile() as unknown as AnyAction);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      let errorMessage = "Failed to submit review. Please try again.";
      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Add helper function to render rating stars
  const renderRatingStars = (editable = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type={editable ? "button" : undefined}
            className={`${editable ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            onClick={editable ? () => setSelectedRating(rating) : undefined}
          >
            <Star
              className={`w-6 h-6 ${
                rating <= (editable ? selectedRating : (user?.averageRating || 0))
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50/30">
        <div className="w-full px-6 py-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-8">Your Profile</h1>

          <div className="bg-white rounded-lg border border-gray-100">
            <div className="flex flex-col lg:flex-row">
              {/* Left Side - Profile Image */}
              <div className="w-full lg:w-[400px] p-10 border-r border-gray-100">
                <div className="flex flex-col items-center text-center">
                  <div className="w-48 h-48 rounded-full bg-gray-50 flex items-center justify-center mb-6 border-4 border-gray-50 relative group">
                    {user.profileImage ? (
                      <img 
                        src={user.profileImage} 
                        alt={user.fullName} 
                        className="w-full h-full rounded-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gray-50 flex items-center justify-center">
                        <UserIcon size={64} className="text-gray-300" />
                      </div>
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-1">{user?.fullName}</h2>
                  <p className="text-gray-500 text-lg mb-6">{user?.role}</p>
                  <input
                    type="file"
                    id="profile-image"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="w-full max-w-[240px] h-11 text-gray-700 border-gray-200 hover:bg-gray-50 transition-colors"
                    onClick={() => document.getElementById('profile-image')?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? 'Uploading...' : 'Change Photo'}
                  </Button>
                </div>
              </div>

              {/* Right Side - Profile Content */}
              <div className="flex-1">
                <Tabs defaultValue="profile" className="w-full">
                  <div className="px-10 pt-8">
                    <TabsList className="grid w-full grid-cols-2 bg-gray-50/80 p-1 rounded-lg">
                      <TabsTrigger 
                        value="profile"
                        className="rounded-md py-3 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                      >
                        Profile
                      </TabsTrigger>
                      <TabsTrigger 
                        value="documents"
                        className="rounded-md py-3 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                      >
                        Medical Documents
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="profile" className="p-10">
                    <div className="space-y-10">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-8">
                          {isDoctor ? 'Professional Information' : 'Personal Information'}
                        </h3>
                        <div className="grid grid-cols-2 gap-x-16 gap-y-8">
                          {isEditing ? (
                            <>
                              <div>
                                <Label className="text-sm font-medium text-gray-500 mb-2">Full Name</Label>
                                <Input
                                  value={editedData.fullName || ''}
                                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-500 mb-2">Email</Label>
                                <Input
                                  value={editedData.email || ''}
                                  onChange={(e) => handleInputChange('email', e.target.value)}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-500 mb-2">Phone</Label>
                                <Input
                                  value={editedData.phoneNumber || ''}
                                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-500 mb-2">Work Place</Label>
                                <Input
                                  value={editedData.clinicLocation || ''}
                                  onChange={(e) => handleInputChange('clinicLocation', e.target.value)}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-500 mb-2">Specialty</Label>
                                <Input
                                  value={editedData.specialty || ''}
                                  onChange={(e) => handleInputChange('specialty', e.target.value)}
                                  className="mt-1"
                                />
                              </div>
                              {renderCertificationsSection()}
                            </>
                          ) : (
                            <>
                          <div>
                            <p className="text-sm font-medium text-gray-500 mb-2">Full Name</p>
                                <p className="text-base text-gray-900">{user?.fullName}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 mb-2">Email</p>
                                <p className="text-base text-gray-900">{user?.email}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                                <p className="text-base text-gray-900">{user?.phoneNumber}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Work Place</p>
                                <p className="text-base text-gray-900">{user?.clinicLocation}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 mb-2">Specialty</p>
                                <p className="text-base text-gray-900">{user?.specialty || 'Not specified'}</p>
                          </div>
                          <div>
                                <p className="text-sm font-medium text-gray-500 mb-2">Rating</p>
                                <div className="flex items-center gap-2">
                                  <div className="flex">
                                    {renderRatingStars(false)}
                                  </div>
                                </div>
                          </div>
                              {renderCertificationsSection()}
                            </>
                          )}
                        </div>

                        <div className="mt-10 flex gap-4">
                          {isEditing ? (
                            <>
                        <Button 
                                className="bg-primary text-white font-medium px-6"
                                size="lg"
                                onClick={handleSaveChanges}
                              >
                                Save Changes
                              </Button>
                              <Button 
                                variant="outline"
                                size="lg"
                                onClick={() => {
                                  setIsEditing(false);
                                  // Reset edited data to original user data
                                  if (user) {
                                    setEditedData({
                                      fullName: user.fullName,
                                      email: user.email,
                                      phoneNumber: user.phoneNumber,
                                      clinicLocation: user.clinicLocation,
                                      specialty: user.specialty,
                                      certifications: user.certifications,
                                      workingHours: user.workingHours,
                                    });
                                  }
                                }}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <Button 
                              className="bg-primary/10 hover:bg-primary/20 text-primary font-medium px-6"
                          variant="ghost"
                          size="lg"
                              onClick={() => setIsEditing(true)}
                        >
                          Edit Information
                        </Button>
                          )}
                        </div>
                      </div>

                      {/* Only show Availability and Working Hours for doctors */}
                      {isDoctor && (
                        <>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-8">Availability</h3>
                            <div className="flex flex-wrap gap-2">
                              {user?.availability?.map((day) => (
                                <Badge 
                                  key={day}
                                  variant="secondary" 
                                  className="bg-primary/10 hover:bg-primary/20 text-primary"
                                >
                                  {day}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="mt-8 bg-white rounded-lg border border-gray-100 p-6">
                            <div className="flex justify-between items-center mb-6">
                              <h2 className="text-xl font-semibold text-gray-900">Working Hours</h2>
                              {!isEditingHours ? (
                                <Button 
                                  onClick={() => setIsEditingHours(true)}
                                  variant="outline"
                                  className="bg-primary/10 hover:bg-primary/20 text-primary"
                                >
                                  Edit Working Hours
                                </Button>
                              ) : (
                                <div className="flex gap-2">
                                  <Button 
                                    onClick={handleSaveHours}
                                    className="bg-primary hover:bg-primary-dark text-white"
                                  >
                                    Save Changes
                                  </Button>
                                  <Button 
                                    variant="outline"
                                    onClick={() => {
                                      setIsEditingHours(false);
                                      if (user?.workingHours) {
                                        const resetHours = [
                                          'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
                                        ].map(day => {
                                          const existingSchedule = user.workingHours.find(h => h.day === day);
                                          return existingSchedule || { day, from: '', to: '' };
                                        });
                                        setEditedHours(resetHours);
                                      }
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              )}
                            </div>

                            <div className="space-y-4">
                              {isEditingHours ? (
                                <div className="grid gap-4">
                                  {editedHours.map((schedule, index) => (
                                    <div key={schedule.day} className="grid grid-cols-12 gap-4 items-center">
                                      <div className="col-span-3">
                                        <Label className="font-medium">{schedule.day}</Label>
                                      </div>
                                      <div className="col-span-3">
                                        <Select
                                          value={schedule.from}
                                          onValueChange={(value) => handleHoursChange(index, 'from', value)}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder="Start time" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {Array.from({ length: 24 }, (_, i) => {
                                              const hour = i.toString().padStart(2, '0');
                                              return (
                                                <SelectItem key={hour} value={`${hour}:00`}>
                                                  {`${hour}:00`}
                                                </SelectItem>
                                              );
                                            })}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="col-span-1 text-center">to</div>
                                      <div className="col-span-3">
                                        <Select
                                          value={schedule.to}
                                          onValueChange={(value) => handleHoursChange(index, 'to', value)}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder="End time" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {Array.from({ length: 24 }, (_, i) => {
                                              const hour = i.toString().padStart(2, '0');
                                              return (
                                                <SelectItem key={hour} value={`${hour}:00`}>
                                                  {`${hour}:00`}
                                                </SelectItem>
                                              );
                                            })}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="col-span-2 flex justify-end">
                                        {(schedule.from || schedule.to) && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleDeleteHours(index)}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="grid gap-3">
                                  {editedHours
                                    .filter(schedule => schedule.from && schedule.to)
                                    .map((schedule) => (
                                      <div key={schedule.day} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                        <span className="font-medium w-32">{schedule.day}</span>
                                        <div className="flex gap-2">
                                          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                                            {schedule.from} - {schedule.to}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  {editedHours.filter(schedule => schedule.from && schedule.to).length === 0 && (
                                    <p className="text-center text-gray-500 py-4">No working hours set</p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="documents" className="p-10">
                    <div className="space-y-6">
                      <div 
                        className="p-8 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center bg-gray-50/50 relative cursor-pointer"
                        onClick={handleBrowseClick}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const file = e.dataTransfer.files?.[0];
                          if (file) {
                            handleDocumentUpload(file);
                          }
                        }}
                      >
                        {isUploading && (
                          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                        <FileText size={40} className="text-gray-400 mb-3" />
                        <p className="font-medium text-gray-900 mb-1">Upload a new document</p>
                        <p className="text-sm text-gray-500 mb-6">Drag and drop files here or click to browse</p>
                        <input 
                          ref={fileInputRef}
                          type="file" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              // Add file type validation
                              const allowedTypes = [
                                'application/pdf',
                                'application/msword',
                                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                                'image/jpeg',
                                'image/png'
                              ];
                              
                              if (!allowedTypes.includes(file.type)) {
                                toast({
                                  title: "Error",
                                  description: "Please upload a valid document (PDF, DOC, DOCX, JPG, or PNG).",
                                  variant: "destructive",
                                });
                                return;
                              }

                              // Add file size validation (5MB max)
                              if (file.size > 5 * 1024 * 1024) {
                                toast({
                                  title: "Error",
                                  description: "File size should be less than 5MB.",
                                  variant: "destructive",
                                });
                                return;
                              }

                              handleDocumentUpload(file);
                            }
                          }}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                          <Button 
                          type="button"
                            size="lg"
                            variant="outline"
                            className="font-medium"
                          disabled={isUploading}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBrowseClick();
                          }}
                          >
                          {isUploading ? 'Uploading...' : 'Browse Files'}
                          </Button>
                      </div>

                      {isLoadingDocuments ? (
                        <div className="flex justify-center py-8">
                          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : medicalDocuments.length > 0 ? (
                        <div className="grid gap-4">
                          {medicalDocuments.map((doc) => (
                            <div 
                              key={doc._id} 
                              className="bg-white rounded-lg border border-gray-100 hover:border-primary/20 hover:bg-gray-50/50 transition-all duration-200"
                            >
                              <div className="p-4">
                                <div className="flex items-start space-x-4">
                                  <div className="p-2 bg-gray-50 rounded-lg">
                                    {getFileIcon(doc.fileName)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <h4 className="text-base font-medium text-gray-900 truncate">
                                        {doc.fileName}
                                      </h4>
                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                          onClick={() => window.open(doc.fileUrl, '_blank')}
                                        >
                                          <Download className="w-4 h-4 mr-1" />
                                          Download
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                          onClick={() => handleDeleteDocument(doc._id)}
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                    <div className="mt-1 flex items-center text-sm text-gray-500">
                                      <Calendar className="w-4 h-4 mr-1" />
                                      <span>
                                        Uploaded on {formatDate(doc.uploadDate)}
                                      </span>
                                    </div>
                                    <div className="mt-2 flex items-center gap-2">
                                      {doc.fileName.endsWith('.pdf') && (
                                        <Badge variant="secondary" className="bg-red-50 text-red-700 hover:bg-red-100">
                                          PDF
                                        </Badge>
                                      )}
                                      {(doc.fileName.endsWith('.doc') || doc.fileName.endsWith('.docx')) && (
                                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                                          {doc.fileName.endsWith('.doc') ? 'DOC' : 'DOCX'}
                                        </Badge>
                                      )}
                                      {(doc.fileName.endsWith('.jpg') || doc.fileName.endsWith('.jpeg') || doc.fileName.endsWith('.png')) && (
                                        <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100">
                                          {doc.fileName.split('.').pop()?.toUpperCase()}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-gray-50/50 rounded-lg border-2 border-dashed border-gray-200">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <h3 className="text-lg font-medium text-gray-900 mb-1">No Documents</h3>
                        <p className="text-gray-500">
                            You haven't uploaded any medical documents yet.
                        </p>
                      </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
