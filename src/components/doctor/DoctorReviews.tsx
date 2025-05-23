
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, StarHalf, StarOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Review } from '@/types';

// Mock reviews - in a real app, these would come from an API
const mockReviews: Review[] = [
  {
    id: '1',
    doctorId: '1',
    patientId: '101',
    patientName: 'Sarah Johnson',
    rating: 5,
    comment: 'Dr. Smith is incredibly thorough and caring. He took the time to explain everything and made me feel at ease.',
    date: '2025-04-28T14:30:00Z'
  },
  {
    id: '2',
    doctorId: '1',
    patientId: '102',
    patientName: 'Michael Brown',
    rating: 4,
    comment: 'Very knowledgeable doctor. Wait time was a bit long, but the care was excellent.',
    date: '2025-04-15T09:45:00Z'
  },
  {
    id: '3',
    doctorId: '2',
    patientId: '103',
    patientName: 'Emily Davis',
    rating: 5,
    comment: 'Dr. Johnson was amazing with my child. Very patient and explained everything clearly.',
    date: '2025-04-22T11:15:00Z'
  }
];

interface DoctorReviewsProps {
  doctorId: string;
}

const DoctorReviews = ({ doctorId }: DoctorReviewsProps) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    // In a real app, this would be an API call
    const doctorReviews = mockReviews.filter(review => review.doctorId === doctorId);
    setReviews(doctorReviews);
    
    // Check if current user has already reviewed this doctor
    if (currentUser) {
      const userReview = doctorReviews.find(review => review.patientId === currentUser.id);
      if (userReview) {
        setHasReviewed(true);
      }
    }
  }, [doctorId, currentUser]);
  
  const handleSetRating = (value: number) => {
    setRating(value);
  };
  
  const handleSubmitReview = () => {
    if (!currentUser || !currentUser.name) {
      toast({
        title: "Login Required",
        description: "Please login to leave a review.",
        variant: "destructive",
      });
      return;
    }
    
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Create new review object
    const newReviewObj: Review = {
      id: `review-${Date.now()}`,
      doctorId,
      patientId: currentUser.id,
      patientName: currentUser.name,
      rating,
      comment: newReview,
      date: new Date().toISOString()
    };
    
    // In a real app, this would be an API call
    setTimeout(() => {
      setReviews([newReviewObj, ...reviews]);
      setNewReview('');
      setRating(0);
      setHasReviewed(true);
      setIsSubmitting(false);
      
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });
    }, 1000);
  };
  
  const renderStars = (value: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => {
          // Full star
          if (star <= value) {
            return <Star key={star} size={18} className="text-yellow-400 fill-yellow-400" />;
          }
          // Half star
          else if (star - 0.5 <= value) {
            return <StarHalf key={star} size={18} className="text-yellow-400" />;
          }
          // Empty star
          return <StarOff key={star} size={18} className="text-gray-300" />;
        })}
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Review Form */}
      {!hasReviewed && currentUser && currentUser.role === 'patient' && (
        <Card>
          <CardHeader>
            <CardTitle>Write a Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Rating</p>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleSetRating(value)}
                      onMouseEnter={() => setHoverRating(value)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1"
                    >
                      <Star 
                        size={24} 
                        className={`${
                          (hoverRating || rating) >= value 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-gray-300'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <Textarea
                  placeholder="Share your experience with this doctor..."
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  rows={4}
                />
              </div>
              
              <Button 
                className="bg-primary hover:bg-primary-dark text-white" 
                onClick={handleSubmitReview}
                disabled={isSubmitting || rating === 0}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b pb-4 last:border-0">
                  <div className="flex justify-between mb-2">
                    <p className="font-medium">{review.patientName}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(review.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mb-2">
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-6">
              No reviews yet. Be the first to review this doctor!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorReviews;
