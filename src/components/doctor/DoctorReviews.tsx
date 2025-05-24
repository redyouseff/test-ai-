import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/types';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, ThumbsUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DoctorReviewsProps {
  doctorId: string;
}

const DoctorReviews = ({ doctorId }: DoctorReviewsProps) => {
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(0);
  const [reviews] = useState([
    {
      id: '1',
      author: {
        name: 'John Doe',
        avatar: null
      },
      rating: 5,
      content: 'Excellent doctor! Very professional and caring.',
      date: '2024-02-15',
      likes: 12
    },
    {
      id: '2',
      author: {
        name: 'Jane Smith',
        avatar: null
      },
      rating: 4,
      content: 'Great experience overall. Would recommend.',
      date: '2024-02-10',
      likes: 8
    }
  ]);

  const handleSubmitReview = () => {
    if (!review.trim() || rating === 0) return;
    // Implement review submission logic
    console.log('Submitting review:', { review, rating });
    setReview('');
    setRating(0);
  };

  const handleLike = (reviewId: string) => {
    // Implement like functionality
    console.log('Liking review:', reviewId);
  };

  return (
    <div className="space-y-6">
      {currentUser && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-4">Write a Review</h3>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-2xl ${
                      star <= rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <Textarea
                placeholder="Share your experience..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="mb-2"
              />
              <Button 
                onClick={handleSubmitReview}
                disabled={!review.trim() || rating === 0}
              >
                Submit Review
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                <Avatar>
                  <AvatarImage src={review.author.avatar || undefined} alt={review.author.name} />
                  <AvatarFallback>{review.author.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{review.author.name}</h4>
                      <div className="flex items-center gap-1 text-yellow-400">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-600">{review.content}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(review.id)}
                    className="mt-2"
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {review.likes}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {reviews.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No reviews yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorReviews;
