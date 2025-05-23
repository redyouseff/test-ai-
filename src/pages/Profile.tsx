import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/types';
import { fetchProfile } from '../redux/actions/authActions';
import DashboardLayout from '../components/layout/DashboardLayout';
import { PatientProfile, DoctorProfile } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AppDispatch } from '../redux/store';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { FileText, User as UserIcon, Star, StarHalf } from 'lucide-react';
import axios from 'axios';
import { Badge } from "@/components/ui/badge";

interface WorkingHour {
  day: string;
  from: string;
  to: string;
}

// Update ExtendedUser interface to include all required fields
interface ExtendedUser {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  chronicDiseases: string[];
  currentMedications: string[];
  specialty: string;
  clinicLocation: string;
  certifications: string[];
  workingHours: WorkingHour[];
  availability: string[];
  role: string;
  medicalDocuments: string[];
  averageRating?: number;
  numberOfReviews?: number;
  profileImage?: string;
  ProfessionalBio?: string;
  YearsOfExperience?: number;
}

const Profile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading, error } = useSelector((state: RootState) => state.auth) as { user: ExtendedUser | null, loading: boolean, error: string | null };
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingHours, setIsEditingHours] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editedData, setEditedData] = useState<Partial<ExtendedUser>>({});
  const [editedHours, setEditedHours] = useState<WorkingHour[]>([]);
  const [newCertification, setNewCertification] = useState('');

  useEffect(() => {
    dispatch(fetchProfile() as any);
  }, [dispatch]);

  useEffect(() => {
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
      setEditedHours(user.workingHours || []);
    }
  }, [user]);

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

      if (response.status === 200 ) {
        dispatch({
          type: 'UPDATE_PROFILE',
          payload: {
            ...user,
            profileImage: response.data.imageUrl
          } as ExtendedUser
        });

        toast({
          title: "تم بنجاح",
          description: "تم تحديث صورة الملف الشخصي بنجاح",
        });

        // إعادة تحميل الصفحة بعد نجاح التحميل
        window.location.reload();
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error: any) {
      let errorMessage = "فشل في تحميل الصورة. يرجى المحاولة مرة أخرى.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "خطأ",
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

  const handleHoursChange = (index: number, field: keyof WorkingHour, value: string) => {
    setEditedHours(prev => {
      const newHours = [...prev];
      if (field === 'from' || field === 'to') {
        // For time fields, store in 24h format
        newHours[index] = { 
          ...newHours[index], 
          [field]: value ? formatTime(value) : ''
        };
      } else {
        newHours[index] = { ...newHours[index], [field]: value };
      }
      return newHours;
    });
  };

  const handleSaveHours = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Format the working hours for the API
      const formattedHours = editedHours.map(hour => ({
        day: hour.day,
        from: parseTime(hour.from),
        to: parseTime(hour.to)
      }));

      const response = await axios.patch(
        'https://care-insight-api-9ed25d3ea3ea.herokuapp.com/api/v1/users/updateWorkingHours',
        { workingHours: formattedHours },
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
        });
        setIsEditingHours(false);
        
        // Update the local state with the new working hours
        if (response.data?.data?.workingHours) {
          setEditedHours(response.data.data.workingHours);
        }
      }
    } catch (error: unknown) {
      let errorMessage = "Failed to update working hours.";
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

  const renderPatientProfile = () => {
    if (!user || user.role !== 'patient') return null;
    const patient = user as PatientProfile;
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={patient?.name || ''}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={patient?.email || ''}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={patient?.phone || ''}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      value={patient?.age || ''}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={patient?.gender}
                      onValueChange={(value) => handleSelectChange('gender', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maritalStatus">Marital Status</Label>
                    <Select
                      value={patient?.maritalStatus}
                      onValueChange={(value) => handleSelectChange('maritalStatus', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="married">Married</SelectItem>
                        <SelectItem value="divorced">Divorced</SelectItem>
                        <SelectItem value="widowed">Widowed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profession">Profession</Label>
                    <Input
                      id="profession"
                      name="profession"
                      value={patient?.profession || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end space-x-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-primary hover:bg-primary-dark text-white"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">{patient?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{patient?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{patient?.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Age</p>
                    <p className="font-medium">{patient?.age}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="font-medium capitalize">{patient?.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Marital Status</p>
                    <p className="font-medium capitalize">{patient?.maritalStatus}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Profession</p>
                    <p className="font-medium">{patient?.profession}</p>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    className="bg-primary hover:bg-primary-dark text-white"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Information
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Medical Information</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      name="height"
                      type="number"
                      value={patient?.height || ''}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      value={patient?.weight || ''}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bloodType">Blood Type</Label>
                    <Select
                      value={patient?.bloodType}
                      onValueChange={(value) => handleSelectChange('bloodType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood type" />
                      </SelectTrigger>
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
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medicalCondition">Medical Condition</Label>
                  <Textarea
                    id="medicalCondition"
                    name="medicalCondition"
                    value={patient?.medicalCondition || ''}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Describe your current medical condition..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chronicDiseases">Chronic Diseases</Label>
                  <Textarea
                    id="chronicDiseases"
                    name="chronicDiseases"
                    value={patient?.chronicDiseases?.join(', ') || ''}
                    onChange={(e) => {
                      const diseases = e.target.value.split(',').map(disease => disease.trim());
                      if (user && user.role === 'patient') {
                        dispatch({
                          type: 'UPDATE_PROFILE',
                          payload: {
                            ...user,
                            chronicDiseases: diseases
                          }
                        });
                      }
                    }}
                    placeholder="Enter any chronic diseases, separated by commas..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medications">Current Medications</Label>
                  <Textarea
                    id="medications"
                    name="medications"
                    value={patient?.medications?.join(', ') || ''}
                    onChange={(e) => {
                      const medications = e.target.value.split(',').map(med => med.trim());
                      if (user && user.role === 'patient') {
                        dispatch({
                          type: 'UPDATE_PROFILE',
                          payload: {
                            ...user,
                            medications
                          }
                        });
                      }
                    }}
                    placeholder="Enter any medications you are currently taking, separated by commas..."
                  />
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Height</p>
                    <p className="font-medium">{patient?.height} cm</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Weight</p>
                    <p className="font-medium">{patient?.weight} kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Blood Type</p>
                    <p className="font-medium">{patient?.bloodType}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Medical Condition</p>
                  <p className="text-gray-700">{patient?.medicalCondition || 'No information provided.'}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Chronic Diseases</p>
                  {patient?.chronicDiseases && patient.chronicDiseases.length > 0 ? (
                    <ul className="list-disc pl-5 text-gray-700">
                      {patient.chronicDiseases.map((disease, index) => (
                        <li key={index}>{disease}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-700">None reported</p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-500">Current Medications</p>
                  {patient?.medications && patient.medications.length > 0 ? (
                    <ul className="list-disc pl-5 text-gray-700">
                      {patient.medications.map((medication, index) => (
                        <li key={index}>{medication}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-700">None reported</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderDoctorProfile = () => {
    if (!user || user.role !== 'doctor') return null;
    const doctor = user as any;
    
    return (
      <div className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-x-12 gap-y-6">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="text-base mt-1">{doctor.fullName || doctor.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-base mt-1">{doctor.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-base mt-1">{doctor.phoneNumber || doctor.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Work Place</p>
                <p className="text-base mt-1">{doctor.workPlace || doctor.clinicLocation}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Specialty</p>
                <p className="text-base mt-1">{doctor.specialty}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Years of Experience</p>
                <p className="text-base mt-1">{doctor.experience} years</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Professional Bio</p>
                <p className="text-base mt-1">{doctor.bio || `Dr. ${doctor.name} is a leading neurologist specializing in brain cancer treatment with ${doctor.experience} years of experience.`}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Certifications</p>
                <ul className="list-disc pl-5 mt-1">
                  {doctor.certifications?.map((cert: string, index: number) => (
                    <li key={index} className="text-base">{cert}</li>
                  )) || (
                    <>
                      <li>Board Certified Neurologist</li>
                      <li>Brain Cancer Specialist</li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            <Button 
              className="bg-primary/10 hover:bg-primary/20 text-primary mt-8"
              variant="ghost"
              onClick={() => setIsEditing(true)}
            >
              Edit Information
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Availability</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
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
                        <h3 className="text-xl font-semibold text-gray-900 mb-8">Professional Information</h3>
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
                                <p className="text-sm font-medium text-gray-500 mb-2">Phone</p>
                                <p className="text-base text-gray-900">{user?.phoneNumber}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500 mb-2">Work Place</p>
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
                                    {renderStars(user?.averageRating || 0)}
                                  </div>
                                  <p className="text-base text-gray-900">
                                    ({user?.numberOfReviews || 0} {user?.numberOfReviews === 1 ? 'review' : 'reviews'})
                                  </p>
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

                    </div>
                  </TabsContent>
                  
                  <TabsContent value="documents" className="p-10">
                    <div className="grid gap-6">
                      <div className="p-8 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center bg-gray-50/50">
                        <FileText size={40} className="text-gray-400 mb-3" />
                        <p className="font-medium text-gray-900 mb-1">Upload a new document</p>
                        <p className="text-sm text-gray-500 mb-6">Drag and drop files here or click to browse</p>
                        <input type="file" className="hidden" id="file-upload" />
                        <label htmlFor="file-upload">
                          <Button 
                            size="lg"
                            variant="outline"
                            className="font-medium"
                          >
                            Browse Files
                          </Button>
                        </label>
                      </div>

                      <div className="text-center py-6">
                        <p className="text-gray-500">
                          No documents uploaded yet.
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Working Hours Section */}
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
                      className="bg-primary text-white"
                    >
                      Save Changes
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setIsEditingHours(false);
                        setEditedHours(user?.workingHours || []);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              {isEditingHours ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {editedHours.map((hour, index) => (
                    <div key={index} className="bg-gray-50/80 p-4 rounded-lg space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-base font-medium">{hour.day}</Label>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-sm text-gray-500">From</Label>
                          <Input
                            type="time"
                            value={parseTime(hour.from)}
                            onChange={(e) => handleHoursChange(index, 'from', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm text-gray-500">To</Label>
                          <Input
                            type="time"
                            value={parseTime(hour.to)}
                            onChange={(e) => handleHoursChange(index, 'to', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {editedHours.map((hour, index) => (
                    hour.from && hour.to ? (
                      <div key={index} className="bg-gray-50/80 p-4 rounded-lg">
                        <div className="flex flex-col">
                          <p className="font-medium text-gray-900 mb-2">{hour.day}</p>
                          <p className="text-sm text-gray-500">{hour.from} - {hour.to}</p>
                        </div>
                      </div>
                    ) : null
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
