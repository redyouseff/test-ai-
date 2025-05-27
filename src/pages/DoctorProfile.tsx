import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/types';
import Layout from '../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MessageSquare, Star, MapPin, Clock, Phone, Mail, GraduationCap, Building, Clock3, User } from 'lucide-react';
import axios from 'axios';
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import MessageButton from '@/components/common/MessageButton';

interface WorkingHours {
  day: string;
  from: string;
  to: string;
}

interface SpecialtyInfo {
  _id: string;
  name: string;
  description: string;
}

interface Doctor {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  specialty: SpecialtyInfo;
  clinicLocation: string;
  certifications: string[];
  workingHours: WorkingHours[];
  availability: string[];
  averageRating: number;
  numberOfReviews: number;
  profileImage: string;
}

interface ReviewType {
  _id: string;
  doctor: string;
  patient: {
    _id: string;
    fullName: string;
    profileImage?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  message: string;
  data: Doctor;
}

const DoctorProfile = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

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

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const response = await axios.get(
        `https://care-insight-api-9ed25d3ea3ea.herokuapp.com/api/v1/reviews/doctor/${doctorId}`
      );
      
      // Handle the new response structure
      if (response.data?.status === "success" && response.data?.data?.reviews) {
        setReviews(response.data.data.reviews);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
      toast({
        title: "Error",
        description: "Failed to load reviews. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    if (doctorId) {
      fetchReviews();
    }
  }, [doctorId]);

  const handleSubmitReview = async () => {
    if (!rating || !review.trim()) {
      toast({
        title: "Error",
        description: "Please provide both rating and review",
        variant: "destructive",
      });
      return;
    }

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

      const response = await axios.post(
        'https://care-insight-api-9ed25d3ea3ea.herokuapp.com/api/v1/reviews',
        {
          doctorId,
          rating,
          comment: review
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 201 || response.status === 200) {
        toast({
          title: "Success",
          description: "Review submitted successfully",
          variant: "default",
          className: "bg-green-500 text-white border-none"
        });

        // Reset form
        setRating(5);
        setReview('');

        // Refresh reviews and doctor data
        fetchReviews();
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
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="md:col-span-4">
            <Card>
              <CardContent className="pt-6">
                {/* Profile Header with Purple Background */}
                <div className="relative">
                  <div className="absolute top-0 left-0 right-0 h-24 bg-primary/20 rounded-t-lg"></div>
                  <div className="relative pt-8 px-4 text-center">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white shadow-lg">
                      <img 
                        src={doctor.profileImage}
                        alt={doctor.fullName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h2 className="text-xl font-bold mb-1">{doctor.fullName}</h2>
                    <p className="text-gray-600 text-sm mb-2">{doctor.specialty.name}</p>
                    <div className="flex items-center justify-center gap-1 mb-4">
                      <Star className="w-4 h-4 text-amber-500 fill-current" />
                      <span className="font-medium">{doctor.averageRating}</span>
                      <span className="text-gray-500">({doctor.numberOfReviews} reviews)</span>
                    </div>
                    <div className="flex gap-2 mb-6">
                      <MessageButton 
                        userId={doctor._id}
                        variant="outline"
                        size="default"
                        showIcon={true}
                        className="flex-1"
                      />
                      <Button 
                        size="sm"
                        className="flex-1 bg-primary"
                        onClick={() => navigate(`/book-appointment/${doctor._id}`)}
                      >
                        Book
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Doctor Info */}
                <div className="border-t pt-4 space-y-4">
                  <div className="px-4">
                    <h3 className="font-semibold mb-2">Certifications</h3>
                    <div className="space-y-2">
                      {doctor.certifications.map((cert, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <GraduationCap className="h-4 w-4 text-gray-500" />
                          <span>{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="px-4 pt-2 border-t">
                    <h3 className="font-semibold mb-2">Contact</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{doctor.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{doctor.phoneNumber}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-500" />
                        <span>{doctor.clinicLocation}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="md:col-span-8 space-y-6">
            {/* Availability Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock3 className="h-5 w-5" />
                  Availability Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {doctor.workingHours
                    .filter(hours => hours.from && hours.to)
                    .map((hours, index) => (
                      <div key={index} className="flex items-center">
                        <span className="w-24 font-medium">{hours.day}</span>
                        <div className="flex gap-2">
                          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                            {hours.from} - {hours.to}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Patient Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Patient Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Write a Review */}
                <div className="mb-8">
                  <h3 className="font-semibold mb-4">Write a Review</h3>
                  <div className="mb-4">
                    <div className="flex gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className={`p-1 ${rating >= star ? 'text-amber-500' : 'text-gray-300'}`}
                        >
                          <Star className="h-6 w-6 fill-current" />
                        </button>
                      ))}
                    </div>
                    <Textarea
                      placeholder="Share your experience with this doctor..."
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <Button 
                      className="mt-3 bg-primary"
                      onClick={handleSubmitReview}
                    >
                      Submit Review
                    </Button>
                  </div>
                </div>

                {/* Reviews List */}
                <div>
                  <h3 className="font-semibold mb-4">Patient Reviews</h3>
                  {loadingReviews ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : !Array.isArray(reviews) || reviews.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      No reviews yet. Be the first to review this doctor!
                    </p>
                  ) : (
                    <div className="space-y-6">
                      {reviews.map((review: ReviewType) => (
                        <div key={review._id} className="border-b border-gray-100 pb-6 last:border-0">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                              {review.patient?.profileImage ? (
                                <img 
                                  src={review.patient.profileImage} 
                                  alt={review.patient.fullName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="w-6 h-6 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h4 className="font-medium">{review.patient?.fullName || 'Anonymous'}</h4>
                                  <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`h-4 w-4 ${
                                          star <= (review.rating || 0)
                                            ? 'text-amber-500 fill-current'
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <span className="text-sm text-gray-500">
                                  {formatDate(review.createdAt)}
                                </span>
                              </div>
                              <p className="text-gray-600">{review.comment}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorProfile;
