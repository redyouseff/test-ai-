import React, { useState } from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/types';
import { useMutation } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageSquare,
  Heart,
  Calendar,
  ThumbsUp,
  Send
} from 'lucide-react';
import { HealthPost, Comment, CommentForm } from '@/types/healthyTalk';
import { likePost, commentOnPost, requestConsultation } from '@/api/healthyTalk';
import { toast } from "@/hooks/use-toast";

interface HealthPostProps {
  post: HealthPost;
}

const HealthPostComponent: React.FC<HealthPostProps> = ({ post }) => {
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [isCommenting, setIsCommenting] = useState(false);
  const [comment, setComment] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);
  
  const likeMutation = useMutation({
    mutationFn: likePost,
    onSuccess: () => {
      toast({
        title: "Post liked",
        description: "You've successfully liked this post",
      });
    }
  });

  const commentMutation = useMutation({
    mutationFn: commentOnPost,
    onSuccess: () => {
      setComment('');
      setIsCommenting(false);
      toast({
        title: "Comment posted",
        description: "Your comment was posted successfully",
      });
    }
  });

  const consultationMutation = useMutation({
    mutationFn: requestConsultation,
    onSuccess: () => {
      toast({
        title: "Consultation requested",
        description: "Your consultation request has been sent to the doctor",
      });
    }
  });

  const handleLike = () => {
    if (currentUser) {
      likeMutation.mutate({ postId: post.id, userId: currentUser.id });
    } else {
      toast({
        title: "Action required",
        description: "Please log in to like posts",
        variant: "destructive"
      });
    }
  };

  const handleComment = () => {
    if (!comment.trim()) return;
    
    if (currentUser) {
      const commentData: CommentForm = {
        postId: post.id, 
        userId: currentUser.id,
        content: comment
      };
      commentMutation.mutate(commentData);
    } else {
      toast({
        title: "Action required",
        description: "Please log in to comment",
        variant: "destructive"
      });
    }
  };

  const handleConsultation = () => {
    if (currentUser && currentUser.role === 'patient') {
      consultationMutation.mutate({ 
        doctorId: post.doctor.id, 
        patientId: currentUser.id,
        postId: post.id
      });
    } else if (!currentUser) {
      toast({
        title: "Action required",
        description: "Please log in to request a consultation",
        variant: "destructive"
      });
    }
  };

  const displayedComments = showAllComments 
    ? post.comments 
    : post.comments.slice(0, 2);

  return (
    <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <Link to={`/doctor/${post.doctor.id}`}>
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={post.doctor.profileImage} alt={post.doctor.name} />
              <AvatarFallback>{post.doctor.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <Link to={`/doctor/${post.doctor.id}`} className="font-medium hover:underline">
              Dr. {post.doctor.name}
            </Link>
            <p className="text-sm text-muted-foreground">{post.doctor.specialty}</p>
          </div>
          <div className="ml-auto flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-1 h-3 w-3" />
            {format(new Date(post.publishedAt), 'MMM d, yyyy')}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <Link to={`/healthy-talk/${post.id}`}>
          <h3 className="text-xl font-bold mb-2 hover:text-primary transition-colors">
            {post.title}
          </h3>
        </Link>
        
        <div className="text-gray-700 mb-4">
          {post.content.length > 300 
            ? `${post.content.substring(0, 300)}...` 
            : post.content
          }
          {post.content.length > 300 && (
            <Link to={`/healthy-talk/${post.id}`} className="text-primary font-medium ml-1">
              Read more
            </Link>
          )}
        </div>
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.tags.map(tag => (
              <span key={tag} className="bg-accent px-2 py-0.5 text-xs rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col border-t pt-4">
        <div className="flex justify-between items-center w-full mb-4">
          <div className="flex gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={handleLike}
            >
              <Heart 
                className={`h-4 w-4 ${post.likes.includes(currentUser?.id || '') ? 'fill-primary text-primary' : ''}`} 
              />
              <span>{post.likes.length}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => setIsCommenting(!isCommenting)}
            >
              <MessageSquare className="h-4 w-4" />
              <span>{post.comments.length}</span>
            </Button>
          </div>
          
          {currentUser && currentUser.role === 'patient' && (
            <Button 
              size="sm" 
              className="ml-auto"
              onClick={handleConsultation}
              disabled={consultationMutation.isPending}
            >
              Request Consultation
            </Button>
          )}
        </div>
        
        {isCommenting && (
          <div className="w-full flex gap-2 mb-4">
            <Textarea 
              placeholder="Write a comment..." 
              className="min-h-[80px]" 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <Button 
              className="self-end"
              onClick={handleComment}
              disabled={commentMutation.isPending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {post.comments.length > 0 && (
          <div className="w-full space-y-3">
            {displayedComments.map((comment: Comment) => (
              <div key={comment.id} className="flex gap-2 p-2 rounded-md bg-secondary/50">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={comment.user.profileImage} alt={comment.user.name} />
                  <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-sm">{comment.user.name}</p>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(comment.createdAt), 'MMM d')}
                    </span>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              </div>
            ))}
            
            {post.comments.length > 2 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-center"
                onClick={() => setShowAllComments(!showAllComments)}
              >
                {showAllComments ? 'Show less comments' : `View all ${post.comments.length} comments`}
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default HealthPostComponent;
