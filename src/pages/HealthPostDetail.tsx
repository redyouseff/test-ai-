import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  MessageSquare, 
  Clock, 
  Calendar,
  Send,
  Share,
  ThumbsUp,
  ArrowLeft
} from 'lucide-react';
import { fetchPostById, commentOnPost, likePost, requestConsultation } from '@/api/healthyTalk';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/types';
import { toast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getApiUrl } from '@/lib/utils';

interface HealthPost {
  _id: string;
  title: string;
  content: string;
  category: 'Articles' | 'Case Studies' | 'Research';
  tags: string[];
  image?: string;
  createdAt: string;
  updatedAt: string;
  author: {
    _id: string;
    fullName: string;
    profileImage?: string;
    specialty: {
      _id: string;
      name: string;
    };
  };
  likes: Array<{
    _id: string;
    fullName: string;
    profileImage?: string;
  }>;
  comments: Array<{
    _id: string;
    user: {
      _id: string;
      fullName: string;
      profileImage?: string;
    };
    text: string;
    createdAt: string;
  }>;
}

const HealthPostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [post, setPost] = useState<HealthPost | null>(null);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  const { data: postData, isLoading: queryLoading, error } = useQuery({
    queryKey: ['healthPost', id],
    queryFn: () => fetchPostById(id!),
    enabled: !!id
  });

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

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(getApiUrl(`/api/v1/health-talks/${id}`));
        
        if (!response.ok) {
          throw new Error('Failed to fetch post');
        }
        
        const data = await response.json();
        if (data.status === 'success') {
          setPost(data.data);
        } else {
          throw new Error(data.message || 'Failed to load post details');
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load post details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id]);

  const handleLike = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please login to like posts",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`/api/v1/health-talks/${id}/like`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to like post');
      
      const data = await response.json();
      if (data.status === 'success') {
        // Update post data
        setPost(prev => {
          if (!prev) return prev;
          const userLiked = prev.likes.some(like => like._id === currentUser.id);
          const userInfo = {
            _id: currentUser.id,
            fullName: currentUser.fullName,
            ...(currentUser.profileImage && { profileImage: currentUser.profileImage })
          };
          return {
            ...prev,
            likes: userLiked 
              ? prev.likes.filter(like => like._id !== currentUser.id)
              : [...prev.likes, userInfo]
          };
        });
      }
    } catch (error) {
      console.error('Error liking post:', error);
      toast({
        title: "Error",
        description: "Failed to like post",
        variant: "destructive",
      });
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please login to comment",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmittingComment(true);
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`/api/v1/health-talks/${id}/comments`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: comment }),
      });

      if (!response.ok) throw new Error('Failed to add comment');
      
      const data = await response.json();
      if (data.status === 'success') {
        // Clear comment input
        setComment('');
        
        // Refresh post data to show new comment
        const updatedPostResponse = await fetch(getApiUrl(`/api/v1/health-talks/${id}`));
        const updatedPostData = await updatedPostResponse.json();
        if (updatedPostData.status === 'success') {
          setPost(updatedPostData.data);
        }

        toast({
          title: "Success",
          description: "Comment added successfully",
        });
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleConsultation = () => {
    if (currentUser && currentUser.role === 'patient' && post) {
      consultationMutation.mutate({ 
        doctorId: post.author._id, 
        patientId: currentUser.id,
        postId: post._id
      });
    } else if (!currentUser) {
      toast({
        title: "Action required",
        description: "Please log in to request a consultation",
        variant: "destructive"
      });
    }
  };


  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-12 px-4 text-center">
          <p>Loading post...</p>
        </div>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout>
        <div className="container mx-auto py-12 px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <p className="mb-8">The post you are looking for does not exist.</p>
          <Button 
            className="bg-primary hover:bg-primary-dark text-white"
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate('/healthy-talk')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Healthy Talk
          </Button>
        </div>
        
        <Card className="overflow-hidden">
          {post.image && (
            <div className="w-full h-[400px] relative">
              <img 
                src={post.image} 
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={post.author.profileImage} />
                  <AvatarFallback>{post.author.fullName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">Dr. {post.author.fullName}</p>
                  <p className="text-sm text-gray-500">{post.author.specialty?.name || 'Healthcare Professional'}</p>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-1" />
                {format(new Date(post.createdAt), 'MMM d, yyyy')}
              </div>
            </div>
            
            <div>
              <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">{post.category}</Badge>
                {post.tags[0].split(',').map((tag, index) => (
                  <Badge key={index} variant="outline">{tag}</Badge>
                ))}
              </div>
              <div className="prose max-w-none">
                {post.content}
              </div>
            </div>
            
            <div className="border-t pt-6">
              <div className="flex items-center gap-4 mb-6">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={handleLike}
                >
                  <Heart 
                    className={`h-4 w-4 ${
                      post.likes.some(like => like._id === currentUser?.id)
                        ? 'fill-primary text-primary' 
                        : ''
                    }`} 
                  />
                  <span>{post.likes.length}</span>
                </Button>
                <div className="flex items-center gap-1 text-gray-500">
                  <MessageSquare className="h-4 w-4" />
                  <span>{post.comments.length} Comments</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Comments</h3>
                <div className="flex gap-2">
                  <textarea
                    className="flex-1 min-h-[100px] p-3 border rounded-lg resize-none"
                    placeholder="Write a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <Button 
                    className="self-start"
                    onClick={handleComment}
                    disabled={isSubmittingComment || !comment.trim()}
                  >
                    Post
                  </Button>
                </div>

                <div className="space-y-4 mt-6">
                  {post.comments.map((comment) => (
                    <div key={comment._id} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.user.profileImage} />
                        <AvatarFallback>{comment.user.fullName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{comment.user.fullName}</span>
                          <span className="text-sm text-gray-500">
                            {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <p className="mt-1 text-gray-700">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default HealthPostDetail;
