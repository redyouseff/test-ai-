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
  ThumbsUp
} from 'lucide-react';
import { fetchPostById, commentOnPost, likePost, requestConsultation } from '@/api/healthyTalk';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/types';
import { toast } from '@/hooks/use-toast';

const HealthPostDetail = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [post, setPost] = useState<any>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  
  const { data: postData, isLoading, error } = useQuery({
    queryKey: ['healthPost', postId],
    queryFn: () => fetchPostById(postId!),
    enabled: !!postId
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
    if (!postId) return;

    // Find the post
    const foundPost = mockHealthPosts.find(p => p.id === postId);
    if (foundPost) {
      setPost(foundPost);
    }
    setLoading(false);
  }, [postId]);

  const handleLike = () => {
    if (currentUser && post) {
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
    if (!comment.trim() || !post) return;
    
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
    if (currentUser && currentUser.role === 'patient' && post) {
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

  if (loading) {
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
            Back to Healthy Talk
          </Button>
        </div>
        
        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          {post.coverImage && (
            <div className="w-full h-64 md:h-80 overflow-hidden">
              <img 
                src={post.coverImage} 
                alt={post.title} 
                className="w-full h-full object-cover" 
              />
            </div>
          )}
          
          <div className="p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Link to={`/doctor/${post.doctor.id}`} className="flex items-center gap-3 group">
                  <Avatar className="h-12 w-12 border">
                    <AvatarImage src={post.doctor.profileImage} alt={post.doctor.name} />
                    <AvatarFallback>{post.doctor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium group-hover:text-primary transition-colors">
                      Dr. {post.doctor.name}
                    </p>
                    <p className="text-sm text-muted-foreground">{post.doctor.specialty}</p>
                  </div>
                </Link>
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-1 h-4 w-4" />
                <span className="mr-3">{format(new Date(post.publishedAt), 'MMM d, yyyy')}</span>
                <Clock className="mr-1 h-4 w-4" />
                <span>{post.readingTime} min read</span>
              </div>
            </div>
            
            <div className="prose max-w-none mb-8">
              {post.content.split('\n').map((paragraph, index) => (
                <p key={index} className="my-4">{paragraph}</p>
              ))}
            </div>
            
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map(tag => (
                  <span key={tag} className="bg-accent px-3 py-1 text-sm rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            <div className="flex justify-between items-center border-t border-b py-4 my-6">
              <div className="flex gap-6">
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2"
                  onClick={handleLike}
                >
                  <Heart 
                    className={`h-5 w-5 ${post.likes.includes(currentUser?.id || '') ? 'fill-primary text-primary' : ''}`} 
                  />
                  <span>{post.likes.length} likes</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2"
                  onClick={() => document.getElementById('comment-box')?.focus()}
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>{post.comments.length} comments</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2"
                >
                  <Share className="h-5 w-5" />
                  <span>Share</span>
                </Button>
              </div>
              
              {currentUser && currentUser.role === 'patient' && (
                <Button 
                  onClick={handleConsultation}
                  disabled={consultationMutation.isPending}
                >
                  Request Consultation
                </Button>
              )}
            </div>
            
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Comments ({post.comments.length})</h3>
              
              {currentUser ? (
                <div className="flex gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={currentUser.profileImage} alt={currentUser.name} />
                    <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea 
                      id="comment-box"
                      placeholder="Add a comment..." 
                      className="mb-2"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleComment}
                        disabled={!comment.trim() || commentMutation.isPending}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Comment
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-4 bg-accent rounded-lg">
                  <p>Please <Link to="/login" className="text-primary font-medium">log in</Link> to comment</p>
                </div>
              )}
              
              <Separator />
              
              {post.comments.length > 0 ? (
                <div className="space-y-6">
                  {post.comments.map(comment => (
                    <div key={comment.id} className="flex gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={comment.user.profileImage} alt={comment.user.name} />
                        <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium">{comment.user.name}</p>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <p className="mt-1">{comment.content}</p>
                        <div className="mt-2">
                          <Button variant="ghost" size="sm" className="h-6 px-2">
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            <span className="text-xs">{comment.likes || 0}</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6">
                  <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
                </div>
              )}
            </div>
          </div>
        </article>
      </div>
    </Layout>
  );
};

export default HealthPostDetail;
