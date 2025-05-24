import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Star, Clock, User, MessageCircle, Phone, Mail, GraduationCap } from 'lucide-react';
import axios from 'axios';
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface WorkingHours {
  day: string;
  from: string;
  to: string;
}

interface MedicalDocument {
  fileName: string;
  fileUrl: string;
  _id: string;
}

interface SpecialtyInfo {
  _id: string;
  name: string;
  description: string;
}

interface Review {
  rating: number;
  comment: string;
}

interface Doctor {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  chronicDiseases: string[];
  currentMedications: string[];
  specialty: SpecialtyInfo;
  clinicLocation: string;
  certifications: string[];
  workingHours: WorkingHours[];
  availability: string[];
  medicalDocuments: MedicalDocument[];
  reviews: string[];
  averageRating: number;
  numberOfReviews: number;
  profileImage: string;
  isVerified: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  message: string;
  data: Doctor;
}

const DoctorDetail = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewData, setReviewData] = useState<Review>({
    rating: 5,
    comment: ''
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);

  useEffect(() => {
    const fetchDoctor = async () => {
      if (!doctorId) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get<ApiResponse>(
          `https://care-insight-api-9ed25d3ea3ea.herokuapp.com/api/v1/users/${doctorId}`
        );

        if (response.data.message === "success") {
          setDoctor(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching doctor:', error);
        toast({
          title: "Error",
          description: "Failed to load doctor information. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [doctorId, toast]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted, starting review submission...');

    if (!reviewData.comment.trim()) {
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
        toast({
          title: "Error",
          description: "Please login to submit a review",
          variant: "destructive",
        });
        return;
      }

      // Log the request data
      const requestData = {
        doctorId: doctorId,
        rating: selectedRating,
        comment: reviewData.comment
      };
      console.log('Sending review request with data:', requestData);

      const response = await axios.post(
        'https://care-insight-api-9ed25d3ea3ea.herokuapp.com/api/v1/reviews',
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Review API Response:', response);

      if (response.status === 201 || response.status === 200) {
        toast({
          title: "Success",
          description: "Your review has been submitted successfully.",
          variant: "default",
          className: "bg-green-500 text-white border-none"
        });
        
        // Reset form
        setReviewData({ rating: 5, comment: '' });
        setSelectedRating(5);
        
        // Refresh doctor data
        const updatedDoctor = await axios.get<ApiResponse>(
          `https://care-insight-api-9ed25d3ea3ea.herokuapp.com/api/v1/users/${doctorId}`
        );
        if (updatedDoctor.data.message === "success") {
          setDoctor(updatedDoctor.data.data);
        }
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      let errorMessage = "Failed to submit review. Please try again.";
      if (error instanceof Error) {
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

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submit review function called');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Error",
          description: "Please login to submit a review",
          variant: "destructive",
        });
        return;
      }

      const reviewPayload = {
        doctorId: doctorId,
        rating: selectedRating,
        comment: reviewData.comment
      };

      console.log('Sending review data:', reviewPayload);

      const response = await axios.post(
        'https://care-insight-api-9ed25d3ea3ea.herokuapp.com/api/v1/reviews',
        reviewPayload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('API Response:', response);

      if (response.status === 200 || response.status === 201) {
        toast({
          title: "Success",
          description: "Review submitted successfully!",
          variant: "default",
          className: "bg-green-500 text-white border-none"
        });

        // Reset form
        setReviewData({ rating: 5, comment: '' });
        setSelectedRating(5);

        // Refresh doctor data
        const updatedDoctor = await axios.get<ApiResponse>(
          `https://care-insight-api-9ed25d3ea3ea.herokuapp.com/api/v1/users/${doctorId}`
        );
        if (updatedDoctor.data.message === "success") {
          setDoctor(updatedDoctor.data.data);
        }
      }
    } catch (error) {
      console.error('Review submission error:', error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderStarRating = (editable = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            className={`${editable ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            onClick={editable ? () => setSelectedRating(rating) : undefined}
          >
            <Star
              className={`w-6 h-6 ${
                rating <= (editable ? selectedRating : (doctor?.averageRating || 0))
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!doctor) {
    return (
      <Layout>
        <div className="container mx-auto py-12 px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Doctor Not Found</h1>
          <p className="mb-8">The doctor you are looking for does not exist.</p>
          <Button 
            className="bg-primary hover:bg-primary-dark text-white"
            onClick={() => navigate('/specialties')}
          >
            Back to Specialties
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        {/* Doctor Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-32 h-32 rounded-full overflow-hidden shadow-lg">
              <img 
                src={doctor.profileImage}
                alt={doctor.fullName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">{doctor.fullName}</h1>
              <p className="text-gray-600 mb-2">{doctor.specialty.name}</p>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <Star className="w-4 h-4 text-amber-500 fill-current" />
                <span className="font-medium">{doctor.averageRating}</span>
                <span className="text-gray-600">({doctor.numberOfReviews} reviews)</span>
              </div>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <Button 
                  className="bg-primary hover:bg-primary-dark text-white h-8 text-sm px-3 rounded-full flex items-center"
                  onClick={() => navigate(`/book-appointment/${doctor._id}`)}
                >
                  <span className="w-4 h-4 rounded-full bg-primary-light/20 flex items-center justify-center mr-1.5">
                    <Calendar className="h-2.5 w-2.5" />
                  </span>
                  Book Appointment
                </Button>
                <Button 
                  variant="outline"
                  className="h-8 text-sm px-3 rounded-full flex items-center"
                  onClick={() => navigate(`/messages?doctorId=${doctor._id}`)}
                >
                  <span className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center mr-1.5">
                    <MessageCircle className="h-2.5 w-2.5" />
                  </span>
                  Send Message
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-gray-600" />
                  </span>
                  <span>{doctor.clinicLocation}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Phone className="h-4 w-4 text-gray-600" />
                  </span>
                  <span>{doctor.phoneNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-gray-600" />
                  </span>
                  <span>{doctor.email}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Working Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Working Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {doctor.workingHours
                  .filter(hours => hours.from && hours.to)
                  .map((hours, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-medium">{hours.day}</span>
                      <span className="text-gray-600">{hours.from} - {hours.to}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Certifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {doctor.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                      <GraduationCap className="h-3 w-3 text-gray-600" />
                    </span>
                    <span>{cert}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Medical Documents Section */}
        {doctor.medicalDocuments && doctor.medicalDocuments.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-6">Medical Documents</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {doctor.medicalDocuments.map((doc) => (
                <Card key={doc._id} className="overflow-hidden">
                  <img 
                    src={doc.fileUrl}
                    alt={doc.fileName}
                    className="w-full h-48 object-cover"
                  />
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600">{doc.fileName}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Review Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Write a Review</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitReview} className="space-y-4">
              <div className="space-y-2">
                <Label>Your Rating</Label>
                {renderStarRating(true)}
              </div>

              <div className="space-y-2">
                <Label>Your Review</Label>
                <Textarea
                  value={reviewData.comment}
                  onChange={(e) => {
                    console.log('Comment changed:', e.target.value);
                    setReviewData(prev => ({
                      ...prev,
                      comment: e.target.value
                    }));
                  }}
                  placeholder="Share your experience with this doctor..."
                  className="min-h-[100px] resize-none"
                  required
                />
              </div>

              <Button
                type="submit"
                className="bg-primary text-white w-full"
                disabled={!reviewData.comment.trim()}
              >
                Submit Review
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default DoctorDetail; 