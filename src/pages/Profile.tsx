import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/types';
import { fetchProfile } from '../redux/actions/authActions';
import DashboardLayout from '../components/layout/DashboardLayout';
import { PatientProfile, DoctorProfile, User } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { FileText, User as UserIcon } from 'lucide-react';
import axios from 'axios';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state: RootState) => state.auth);
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    dispatch<any>(fetchProfile());
  }, [dispatch]);
 
console.log(user)
  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
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
    const doctor = user as DoctorProfile;
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
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
                      value={doctor?.name || ''}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={doctor?.email || ''}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={doctor?.phone || ''}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workPlace">Work Place</Label>
                    <Input
                      id="workPlace"
                      name="workPlace"
                      value={doctor?.workPlace || ''}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialty">Specialty</Label>
                    <Select
                      value={doctor?.specialty}
                      onValueChange={(value) => handleSelectChange('specialty', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="brain-cancer">Brain Cancer</SelectItem>
                        <SelectItem value="skin-cancer">Skin Cancer</SelectItem>
                        <SelectItem value="chest-cancer">Chest Cancer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      name="experience"
                      type="number"
                      value={doctor?.experience || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={doctor?.bio || ''}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Enter your professional biography..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certifications">Certifications</Label>
                  <Textarea
                    id="certifications"
                    name="certifications"
                    value={doctor?.certifications?.join(', ') || ''}
                    onChange={(e) => {
                      const certifications = e.target.value.split(',').map(cert => cert.trim());
                      if (user && user.role === 'doctor') {
                        dispatch({
                          type: 'UPDATE_PROFILE',
                          payload: {
                            ...user,
                            certifications
                          }
                        });
                      }
                    }}
                    placeholder="Enter your certifications, separated by commas..."
                  />
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
                    <p className="font-medium">{doctor?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{doctor?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{doctor?.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Work Place</p>
                    <p className="font-medium">{doctor?.workPlace}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Specialty</p>
                    <p className="font-medium capitalize">{doctor?.specialty?.replace('-', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Years of Experience</p>
                    <p className="font-medium">{doctor?.experience} years</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Professional Bio</p>
                  <p className="text-gray-700">{doctor?.bio}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Certifications</p>
                  {doctor?.certifications && doctor.certifications.length > 0 ? (
                    <ul className="list-disc pl-5 text-gray-700">
                      {doctor.certifications.map((cert, index) => (
                        <li key={index}>{cert}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-700">No certifications listed</p>
                  )}
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
            <CardTitle>Availability</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                  const isAvailable = doctor?.availableDays?.includes(day);
                  return (
                    <div key={day} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={day}
                        checked={isAvailable}
                        onChange={(e) => {
                          if (user && user.role === 'doctor') {
                            let availableDays = [...(doctor?.availableDays || [])];
                            if (e.target.checked) {
                              if (!availableDays.includes(day)) {
                                availableDays.push(day);
                              }
                            } else {
                              availableDays = availableDays.filter(d => d !== day);
                            }
                            dispatch({
                              type: 'UPDATE_PROFILE',
                              payload: {
                                ...user,
                                availableDays
                              }
                            });
                          }
                        }}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor={day}>{day}</Label>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div>
                <div className="flex flex-wrap gap-2">
                  {doctor?.availableDays?.map((day, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-primary-light text-primary-dark text-sm rounded-full"
                    >
                      {day}
                    </span>
                  ))}
                </div>
                {(!doctor?.availableDays || doctor.availableDays.length === 0) && (
                  <p className="text-gray-500">No availability set</p>
                )}
              </div>
            )}
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Your Profile</h1>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          <Card className="w-full md:w-64">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-primary-light flex items-center justify-center mb-4">
                  {user.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt={user.name} 
                      className="w-full h-full rounded-full object-cover" 
                    />
                  ) : (
                    <UserIcon size={36} className="text-primary-dark" />
                  )}
                </div>
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-gray-500 capitalize">{user.role}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4 w-full"
                >
                  Change Photo
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex-1">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="documents">Medical Documents</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="mt-6">
                {user.role === 'patient' ? renderPatientProfile() : renderDoctorProfile()}
              </TabsContent>
              
              <TabsContent value="documents" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {user.role === 'patient' ? 'Your Medical Documents' : 'Patient Documents'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-4 border border-dashed rounded-md flex flex-col items-center justify-center">
                        <FileText size={32} className="text-gray-400 mb-2" />
                        <p className="font-medium">Upload a new document</p>
                        <p className="text-sm text-gray-500 mb-2">Drag and drop files here or click to browse</p>
                        <input type="file" className="hidden" id="file-upload" />
                        <label htmlFor="file-upload">
                          <div className="bg-primary text-white px-4 py-2 rounded-md cursor-pointer text-sm">
                            Browse Files
                          </div>
                        </label>
                      </div>

                      <div className="text-center p-6">
                        <p className="text-gray-500">
                          No documents uploaded yet.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
