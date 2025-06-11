import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/types";
import { fetchProfile } from "../redux/actions/authActions";
import { AppDispatch } from "../redux/store";
import axios, { AxiosError } from "axios";
import { AnyAction } from "redux";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  User as UserIcon,
  Star,
  StarHalf,
  Download,
  File,
  FileImage,
  Trash2,
  Calendar,
  Camera,
} from "lucide-react";
import { format } from "date-fns";

// Components imports
import DashboardLayout from "../components/layout/DashboardLayout";
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

// Add interface for API response
interface MedicalDocument {
  _id: string;
  fileName: string;
  fileUrl: string;
  fileType?: string;
  uploadDate: string;
}

interface ApiResponse {
  status: string;
  data: MedicalDocument[];
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
  const [newCertification, setNewCertification] = useState("");
  const [medicalDocuments, setMedicalDocuments] = useState<
    Array<{
      _id: string;
      fileName: string;
      fileUrl: string;
      fileType: string;
      uploadDate: string;
    }>
  >([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const [newDisease, setNewDisease] = useState("");
  const [newMedication, setNewMedication] = useState("");

  // Add new state for review
  const [reviewFormData, setReviewFormData] = useState<ReviewFormData>({
    rating: 5,
    comment: "",
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);

  // Computed values
  const isDoctor = user?.role === "doctor";

  const fetchMedicalDocuments = async () => {
    try {
      setIsLoadingDocuments(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get<ApiResponse>(
        "https://care-insight-api-9ed25d3ea3ea.herokuapp.com/api/v1/users/getMedicalDocuments",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.data) {
        // Transform the data to match our state structure
        const transformedDocs = response.data.data.map(
          (doc: MedicalDocument) => ({
            _id: doc._id,
            fileName: doc.fileName,
            fileUrl: doc.fileUrl,
            fileType: doc.fileType || "unknown",
            uploadDate: doc.uploadDate,
          })
        );
        setMedicalDocuments(transformedDocs);
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
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ].map((day) => {
          const existingSchedule = user.workingHours?.find(
            (h) => h.day === day
          );
          return existingSchedule || { day, from: "", to: "" };
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
          currentMedications: user.currentMedications || [],
        });
      }
      fetchMedicalDocuments();
    }
  }, [user, isDoctor]);

  const handleInputChange = (
    name: string,
    value: string | string[] | number
  ) => {
    setEditedData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddCertification = () => {
    if (newCertification.trim()) {
      setEditedData((prev) => ({
        ...prev,
        certifications: [
          ...(prev.certifications || []),
          newCertification.trim(),
        ],
      }));
      setNewCertification("");
    }
  };

  const handleRemoveCertification = (index: number) => {
    setEditedData((prev) => ({
      ...prev,
      certifications: prev.certifications?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const dataToUpdate = {
        fullName: editedData.fullName,
        phoneNumber: editedData.phoneNumber,
        gender: editedData.gender,
        age: editedData.age,
        height: editedData.height,
        weight: editedData.weight,
        bloodType: editedData.bloodType,
        medicalCondition: editedData.medicalCondition,
        chronicDiseases: editedData.chronicDiseases,
        currentMedications: editedData.currentMedications,
      };

      const response = await axios.patch(
        "https://care-insight-api-9ed25d3ea3ea.herokuapp.com/api/v1/users/me",
        dataToUpdate,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Profile information has been updated successfully.",
          variant: "default",
          className: "bg-green-500 text-white border-none",
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
        <Star key={`empty-star-${i}`} className="w-5 h-5 text-gray-300" />
      );
    }

    return stars;
  };

  if (loading)
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  if (error)
    return (
      <div className="text-red-500">حدث خطأ أثناء جلب البيانات: {error}</div>
    );
  if (!user) return <div>No profile data</div>;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
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
    if (!file.type.startsWith("image/")) {
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
      formData.append("profileImage", file);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await axios.post(
        "https://care-insight-api-9ed25d3ea3ea.herokuapp.com/api/v1/users/uploadImage",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        dispatch({
          type: "UPDATE_PROFILE",
          payload: {
            ...user,
            profileImage: response.data.imageUrl,
          } as ExtendedUser,
        });

        toast({
          title: "Success",
          description: "Profile image updated successfully",
        });

        window.location.reload();
      } else {
        throw new Error("Invalid response format from server");
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
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (time: string) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour.toString().padStart(2, "0")}:${minutes} ${ampm}`;
  };

  const parseTime = (timeStr: string) => {
    if (!timeStr) return "";
    const [time, period] = timeStr.split(" ");
    const [hours, minutes] = time.split(":");
    let hour = parseInt(hours);

    if (period === "PM" && hour !== 12) {
      hour += 12;
    } else if (period === "AM" && hour === 12) {
      hour = 0;
    }

    return `${hour.toString().padStart(2, "0")}:${minutes}`;
  };

  const handleHoursChange = (
    dayIndex: number,
    field: "from" | "to",
    value: string
  ) => {
    setEditedHours((prev) => {
      const newHours = [...prev];
      newHours[dayIndex] = {
        ...newHours[dayIndex],
        [field]: value,
      };
      return newHours;
    });
  };

  const handleSaveHours = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Filter out days with empty schedules
      const validHours = editedHours.filter((hour) => hour.from && hour.to);

      const response = await axios.patch(
        "https://care-insight-api-9ed25d3ea3ea.herokuapp.com/api/v1/users/updateWorkingHours",
        { workingHours: validHours },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Working hours have been updated successfully.",
          variant: "default",
          className: "bg-green-500 text-white border-none",
        });
        setIsEditingHours(false);

        // Update local state with the response data
        if (response.data?.data?.workingHours) {
          const updatedHours = [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ].map((day) => {
            const existingSchedule = response.data.data.workingHours.find(
              (h: WorkingHour) => h.day === day
            );
            return existingSchedule || { day, from: "", to: "" };
          });
          setEditedHours(updatedHours);

          // Update the user state in Redux
          dispatch({
            type: "UPDATE_PROFILE",
            payload: {
              ...user,
              workingHours: response.data.data.workingHours,
            },
          });

          // Fetch fresh profile data to ensure everything is up to date
          dispatch(fetchProfile() as unknown as AnyAction);
        }
      }
    } catch (error) {
      console.error("Error updating working hours:", error);
      toast({
        title: "Error",
        description: "Failed to update working hours. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteHours = (dayIndex: number) => {
    setEditedHours((prev) => {
      const newHours = [...prev];
      newHours[dayIndex] = {
        ...newHours[dayIndex],
        from: "",
        to: "",
      };
      return newHours;
    });
  };

  const renderPatientProfile = () => {
    if (!user) return null;
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Personal Information</CardTitle>
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-primary hover:bg-primary-dark text-white"
                >
                  Edit Information
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Full Name</Label>
                {isEditing ? (
                  <Input
                    name="fullName"
                    value={editedData.fullName ?? user.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                    className="mt-1"
                  />
                ) : (
                  <p className="text-gray-700 mt-1">{user.fullName}</p>
                )}
              </div>

              <div>
                <Label>Email</Label>
                <p className="text-gray-700 mt-1">{user.email}</p>
              </div>

              <div>
                <Label>Phone Number</Label>
                {isEditing ? (
                  <Input
                    name="phoneNumber"
                    value={editedData.phoneNumber ?? user.phoneNumber}
                    onChange={(e) =>
                      handleInputChange("phoneNumber", e.target.value)
                    }
                    className="mt-1"
                  />
                ) : (
                  <p className="text-gray-700 mt-1">{user.phoneNumber}</p>
                )}
              </div>

              <div>
                <Label>Gender</Label>
                {isEditing ? (
                  <Select
                    value={editedData.gender ?? user.gender}
                    onValueChange={(value) =>
                      handleInputChange("gender", value)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-gray-700 mt-1 capitalize">{user.gender}</p>
                )}
              </div>

              <div>
                <Label>Age</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    name="age"
                    value={editedData.age ?? user.age}
                    onChange={(e) =>
                      handleInputChange("age", parseInt(e.target.value))
                    }
                    className="mt-1"
                  />
                ) : (
                  <p className="text-gray-700 mt-1">{user.age} years</p>
                )}
              </div>

              <div>
                <Label>Blood Type</Label>
                {isEditing ? (
                  <Select
                    value={editedData.bloodType ?? user.bloodType}
                    onValueChange={(value) =>
                      handleInputChange("bloodType", value)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                        (type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-gray-700 mt-1">
                    {user.bloodType || "Not specified"}
                  </p>
                )}
              </div>

              <div>
                <Label>Height (cm)</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    name="height"
                    value={editedData.height ?? user.height}
                    onChange={(e) =>
                      handleInputChange("height", parseInt(e.target.value))
                    }
                    className="mt-1"
                  />
                ) : (
                  <p className="text-gray-700 mt-1">
                    {user.height || "Not specified"} cm
                  </p>
                )}
              </div>

              <div>
                <Label>Weight (kg)</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    name="weight"
                    value={editedData.weight ?? user.weight}
                    onChange={(e) =>
                      handleInputChange("weight", parseInt(e.target.value))
                    }
                    className="mt-1"
                  />
                ) : (
                  <p className="text-gray-700 mt-1">
                    {user.weight || "Not specified"} kg
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical Information */}
        <Card>
          <CardHeader>
            <CardTitle>Medical Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label>Medical Condition</Label>
                {isEditing ? (
                  <Input
                    name="medicalCondition"
                    value={editedData.medicalCondition ?? user.medicalCondition}
                    onChange={(e) =>
                      handleInputChange("medicalCondition", e.target.value)
                    }
                    className="mt-1"
                  />
                ) : (
                  <p className="text-gray-700 mt-1">
                    {user.medicalCondition || "Not specified"}
                  </p>
                )}
              </div>

              <div>
                <Label>Chronic Diseases</Label>
                <div className="mt-2">
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={newDisease}
                          onChange={(e) => setNewDisease(e.target.value)}
                          placeholder="Add new disease"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            if (newDisease.trim()) {
                              const updatedDiseases = [
                                ...(editedData.chronicDiseases ||
                                  user.chronicDiseases ||
                                  []),
                                newDisease.trim(),
                              ];
                              handleInputChange(
                                "chronicDiseases",
                                updatedDiseases
                              );
                              setNewDisease("");
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(
                          editedData.chronicDiseases ||
                          user.chronicDiseases ||
                          []
                        ).map((disease, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => {
                              const updatedDiseases = (
                                editedData.chronicDiseases ||
                                user.chronicDiseases ||
                                []
                              ).filter((_, i) => i !== index);
                              handleInputChange(
                                "chronicDiseases",
                                updatedDiseases
                              );
                            }}
                          >
                            {disease} ×
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {user.chronicDiseases?.length ? (
                        user.chronicDiseases.map((disease, index) => (
                          <Badge key={index} variant="secondary">
                            {disease}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-gray-500">
                          No chronic diseases recorded
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label>Current Medications</Label>
                <div className="mt-2">
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={newMedication}
                          onChange={(e) => setNewMedication(e.target.value)}
                          placeholder="Add new medication"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            if (newMedication.trim()) {
                              const updatedMedications = [
                                ...(editedData.currentMedications ||
                                  user.currentMedications ||
                                  []),
                                newMedication.trim(),
                              ];
                              handleInputChange(
                                "currentMedications",
                                updatedMedications
                              );
                              setNewMedication("");
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(
                          editedData.currentMedications ||
                          user.currentMedications ||
                          []
                        ).map((medication, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => {
                              const updatedMedications = (
                                editedData.currentMedications ||
                                user.currentMedications ||
                                []
                              ).filter((_, i) => i !== index);
                              handleInputChange(
                                "currentMedications",
                                updatedMedications
                              );
                            }}
                          >
                            {medication} ×
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {user.currentMedications?.length ? (
                        user.currentMedications.map((medication, index) => (
                          <Badge key={index} variant="outline">
                            {medication}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-gray-500">No current medications</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {isEditing && (
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          </div>
        )}
      </div>
    );
  };

  const renderDoctorProfile = () => {
    if (!user || user.role !== "doctor") return null;
    const doctor = user as ExtendedUser;

    return (
      <div className="space-y-6">
        {/* Professional Information */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Professional Information</CardTitle>
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-primary hover:bg-primary-dark text-white"
                >
                  Edit Information
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Full Name</Label>
                {isEditing ? (
                  <Input
                    name="fullName"
                    value={editedData.fullName ?? doctor.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                    className="mt-1"
                  />
                ) : (
                  <p className="text-gray-700 mt-1">{doctor.fullName}</p>
                )}
              </div>

              <div>
                <Label>Email</Label>
                <p className="text-gray-700 mt-1">{doctor.email}</p>
              </div>

              <div>
                <Label>Phone Number</Label>
                {isEditing ? (
                  <Input
                    name="phoneNumber"
                    value={editedData.phoneNumber ?? doctor.phoneNumber}
                    onChange={(e) =>
                      handleInputChange("phoneNumber", e.target.value)
                    }
                    className="mt-1"
                  />
                ) : (
                  <p className="text-gray-700 mt-1">{doctor.phoneNumber}</p>
                )}
              </div>

              <div>
                <Label>Specialty</Label>
                {isEditing ? (
                  <Input
                    name="specialty"
                    value={editedData.specialty ?? doctor.specialty}
                    onChange={(e) =>
                      handleInputChange("specialty", e.target.value)
                    }
                    className="mt-1"
                  />
                ) : (
                  <p className="text-gray-700 mt-1">{doctor.specialty}</p>
                )}
              </div>

              <div>
                <Label>Clinic Location</Label>
                {isEditing ? (
                  <Input
                    name="clinicLocation"
                    value={editedData.clinicLocation ?? doctor.clinicLocation}
                    onChange={(e) =>
                      handleInputChange("clinicLocation", e.target.value)
                    }
                    className="mt-1"
                  />
                ) : (
                  <p className="text-gray-700 mt-1">{doctor.clinicLocation}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Certifications */}
        <Card>
          <CardHeader>
            <CardTitle>Certifications</CardTitle>
          </CardHeader>
          <CardContent>{renderCertificationsSection()}</CardContent>
        </Card>

        {/* Working Hours */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Working Hours</CardTitle>
              {!isEditingHours && (
                <Button
                  onClick={() => setIsEditingHours(true)}
                  className="bg-primary hover:bg-primary-dark text-white"
                >
                  Edit Hours
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isEditingHours ? (
                <div className="grid gap-4">
                  {editedHours.map((schedule, index) => (
                    <div
                      key={schedule.day}
                      className="grid grid-cols-12 gap-4 items-center"
                    >
                      <div className="col-span-3">
                        <Label className="font-medium">{schedule.day}</Label>
                      </div>
                      <div className="col-span-3">
                        <Select
                          value={schedule.from}
                          onValueChange={(value) =>
                            handleHoursChange(index, "from", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Start time" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => {
                              const hour = i.toString().padStart(2, "0");
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
                          onValueChange={(value) =>
                            handleHoursChange(index, "to", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="End time" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => {
                              const hour = i.toString().padStart(2, "0");
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
                  <div className="flex justify-end space-x-4 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditingHours(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSaveHours}>Save Changes</Button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-3">
                  {editedHours
                    .filter((schedule) => schedule.from && schedule.to)
                    .map((schedule) => (
                      <div
                        key={schedule.day}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                      >
                        <span className="font-medium w-32">{schedule.day}</span>
                        <div className="flex gap-2">
                          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                            {schedule.from} - {schedule.to}
                          </span>
                        </div>
                      </div>
                    ))}
                  {editedHours.filter(
                    (schedule) => schedule.from && schedule.to
                  ).length === 0 && (
                    <p className="text-center text-gray-500 py-4">
                      No working hours set
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {isEditing && (
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          </div>
        )}
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
      <Label className="text-sm font-medium text-gray-500 mb-2">
        Certifications
      </Label>
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
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 p-2 rounded"
              >
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
            <div
              key={index}
              className="text-base text-gray-900 bg-gray-50 p-2 rounded"
            >
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
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const formData = new FormData();
      formData.append("medicalDocuments", file);

      const response = await axios.post(
        "https://care-insight-api-9ed25d3ea3ea.herokuapp.com/api/v1/users/uploadMedicalDocuments",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Document uploaded successfully.",
          variant: "default",
          className: "bg-green-500 text-white border-none",
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
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return <FileText className="w-10 h-10 text-red-500" />;
      case "doc":
      case "docx":
        return <File className="w-10 h-10 text-blue-500" />;
      case "jpg":
      case "jpeg":
      case "png":
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
        return "Invalid date";
      }
      return format(date, "MMM dd, yyyy");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  // Add delete handler function
  const handleDeleteDocument = async (documentId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.delete(
        `https://care-insight-api-9ed25d3ea3ea.herokuapp.com/api/v1/users/deleteMedicalDocument/${documentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Document deleted successfully.",
          variant: "default",
          className: "bg-green-500 text-white border-none",
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
    console.log("Form submitted"); // Debug log

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
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Get the doctor ID from the URL
      const pathSegments = window.location.pathname.split("/");
      const doctorId = pathSegments[pathSegments.length - 1];

      console.log("Sending review with data:", {
        doctorId,
        rating: selectedRating,
        comment: reviewFormData.comment,
      });

      const response = await axios.post(
        "https://care-insight-api-9ed25d3ea3ea.herokuapp.com/api/v1/reviews",
        {
          doctorId,
          rating: selectedRating,
          comment: reviewFormData.comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response:", response);

      if (response.status === 201 || response.status === 200) {
        toast({
          title: "Success",
          description: "Your review has been submitted successfully.",
          variant: "default",
          className: "bg-green-500 text-white border-none",
        });

        // Reset form
        setReviewFormData({ rating: 5, comment: "" });
        setSelectedRating(5);

        // Refresh profile data to show updated rating
        dispatch(fetchProfile() as unknown as AnyAction);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
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
            className={`${
              editable
                ? "cursor-pointer hover:scale-110 transition-transform"
                : ""
            }`}
            onClick={editable ? () => setSelectedRating(rating) : undefined}
          >
            <Star
              className={`w-6 h-6 ${
                rating <= (editable ? selectedRating : user?.averageRating || 0)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(fileUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName; // Set the file name

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "File downloaded successfully",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const renderMedicalDocuments = () => {
    if (isLoadingDocuments) {
      return (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    if (!medicalDocuments || medicalDocuments.length === 0) {
      return (
        <div className="text-center py-12 bg-gray-50/50 rounded-lg border-2 border-dashed border-gray-200">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No Documents
          </h3>
          <p className="text-gray-500">
            You haven't uploaded any medical documents yet.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid gap-4">
          {medicalDocuments.map((doc) => (
            <div
              key={doc._id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                {getFileIcon(doc.fileName)}
                <div>
                  <p className="font-medium">{doc.fileName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDownload(doc.fileUrl, doc.fileName)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteDocument(doc._id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600">
              Manage your personal information and documents
            </p>
          </div>
        </div>

        {/* Profile Header Card */}
        <Card className="border-none shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div
                  className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg cursor-pointer hover:opacity-90 transition-opacity relative group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {user?.profileImage ? (
                    <>
                      <img
                        src={user.profileImage}
                        alt={user.fullName}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    </>
                  ) : (
                    <UserIcon size={32} className="text-gray-300" />
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {user?.fullName}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="capitalize">
                    {user?.role}
                  </Badge>
                  {user?.role === "doctor" && user?.specialty && (
                    <Badge variant="secondary">{user.specialty}</Badge>
                  )}
                </div>
                {user?.role === "doctor" && (
                  <div className="flex items-center gap-2 mt-2">
                    {renderRatingStars(false)}
                    <span className="text-sm text-gray-500">
                      ({user.numberOfReviews || 0} reviews)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-white border-b rounded-none w-full justify-start h-12 p-0 space-x-8">
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12"
            >
              Profile Information
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12"
            >
              Medical Documents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            {user?.role === "doctor"
              ? renderDoctorProfile()
              : renderPatientProfile()}
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Medical Documents</CardTitle>
                <p className="text-sm text-gray-500">
                  Upload and manage your medical documents
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Upload Area */}
                <div
                  className="p-8 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center bg-gray-50/50 relative cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => documentInputRef.current?.click()}
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
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  <FileText size={40} className="text-gray-400 mb-3" />
                  <p className="font-medium text-gray-900 mb-1">
                    Upload a new document
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    Drag and drop files here or click to browse
                  </p>
                  <input
                    ref={documentInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleDocumentUpload(file);
                      }
                    }}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </div>

                {/* Documents List */}
                {renderMedicalDocuments()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
