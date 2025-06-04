import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from '@/components/layout/Layout';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import CreatePostDialog from '@/components/healthyTalk/CreatePostDialog';
import { 
  Search, 
  PlusCircle, 
  MessageSquare,
  Heart,
  Calendar,
  Send
} from "lucide-react";
import { RootState, User } from '../redux/types';
import { toast } from "@/hooks/use-toast";
import { getApiUrl } from '@/api/config';

// Types
interface HealthPost {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
  doctor: {
    id: string;
    name: string;
    specialty: string;
    profileImage?: string;
  };
  likes: string[];
  comments: Array<{
    id: string;
    postId: string;
    user: {
      id: string;
      name: string;
      profileImage?: string;
    };
    content: string;
    createdAt: string;
    likes: number;
  }>;
  tags: string[];
  coverImage?: string;
  readingTime?: number;
  category?: string;
}

interface ApiResponse {
  data: Array<{
    _id: string;
    title: string;
    content: string;
    createdAt: string;
    author: {
      _id: string;
      fullName: string;
      specialty?: {
        name: string;
      };
    };
    likes: string[];
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
    tags: string[];
    image?: string;
    category?: 'articles' | 'case-studies' | 'research';
  }>;
}

// Add type for post data
interface PostData {
  _id: string;
  title: string;
  content: string;
  createdAt?: string;
  author: {
    _id: string;
    fullName?: string;
    specialty?: {
      name: string;
    };
  };
  likes: string[];
  comments: Array<{
    _id: string;
    user: {
      _id: string;
      fullName: string;
      profileImage?: string;
    };
    text: string;
    createdAt?: string;
  }>;
  tags: string[];
  image?: string;
  category: 'Articles' | 'Case Studies' | 'Research';
}

const HealthyTalk = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'Articles' | 'Case Studies' | 'Research' | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCommenting, setIsCommenting] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [itemsPerPage] = useState(10);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const authToken = useSelector((state: RootState) => state.auth.token);

  // Add new state for optimistic likes
  const [optimisticLikes, setOptimisticLikes] = useState<{ [key: string]: boolean }>({});

  // Fetch posts with automatic refetch
  const { data: healthPosts = [], isLoading: isLoadingPosts, error: postsError, refetch } = useQuery({
    queryKey: ['healthPosts', selectedSpecialty, selectedFilter],
    queryFn: async () => {
      try {
        const url = new URL(getApiUrl('/api/v1/health-talks'));
        if (selectedSpecialty) url.searchParams.append('specialty', selectedSpecialty);
        if (selectedFilter) url.searchParams.append('filter', selectedFilter);

        const response = await fetch(url.toString());
        if (!response.ok) throw new Error('Failed to fetch posts');
        
        const data = await response.json();
        return data.data.map((post: PostData) => ({
          id: post._id,
          title: post.title,
          content: post.content,
          publishedAt: post.createdAt || new Date().toISOString(),
          doctor: {
            id: post.author._id,
            name: post.author.fullName || 'Unknown Author',
            specialty: post.author.specialty?.name || 'General',
            profileImage: undefined
          },
          likes: Array.isArray(post.likes) ? post.likes : [],
          comments: Array.isArray(post.comments) 
            ? post.comments.map((comment) => ({
                id: comment._id,
                postId: post._id,
                user: {
                  id: comment.user._id,
                  name: comment.user.fullName,
                  profileImage: comment.user.profileImage
                },
                content: comment.text,
                createdAt: comment.createdAt || new Date().toISOString(),
                likes: 0
              }))
            : [],
          tags: Array.isArray(post.tags) ? post.tags : [],
          coverImage: post.image,
          readingTime: Math.ceil(post.content.split(' ').length / 200),
          category: post.category
        }));
      } catch (error) {
        console.error('Error fetching posts:', error);
        throw error;
      }
    },
    refetchOnWindowFocus: true
  });

  // Fetch specialties
  const { data: specialties = [] } = useQuery({
    queryKey: ['specialties'],
    queryFn: async () => {
      const response = await fetch(getApiUrl('/api/v1/specialties'));
      if (!response.ok) throw new Error('Failed to fetch specialties');
      const data = await response.json();
      return data.data;
    }
  });

  // Fetch doctors
  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors', selectedSpecialty],
    queryFn: async () => {
      const url = new URL(getApiUrl('/api/v1/doctors'));
      if (selectedSpecialty) url.searchParams.append('specialty', selectedSpecialty);
      
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to fetch doctors');
      const data = await response.json();
      return data.data;
    },
    enabled: true
  });

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async ({ postId }: { postId: string }) => {
      const response = await fetch(getApiUrl(`/api/v1/health-talks/${postId}/like`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && {
            'Authorization': `Bearer ${authToken}`
          })
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to like post' }));
        throw new Error(error.message || 'Failed to like post');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Optimistically update the UI
      queryClient.setQueryData<HealthPost[]>(['healthPosts'], (oldData) => {
        if (!oldData) return oldData;
        return oldData.map((post) => {
          if (post.id === variables.postId) {
            const userLiked = post.likes.includes(currentUser?.id || '');
            return {
              ...post,
              likes: userLiked 
                ? post.likes.filter(id => id !== currentUser?.id)
                : [...post.likes, currentUser?.id]
            };
          }
          return post;
        });
      });

      toast({
        title: "Success",
        description: "Post updated successfully",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update post",
        variant: "destructive"
      });
    }
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      const response = await fetch(getApiUrl(`/api/v1/health-talks/${postId}/comments`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && {
            'Authorization': `Bearer ${authToken}`
          })
        },
        body: JSON.stringify({ text: content })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to add comment' }));
        throw new Error(error.message || 'Failed to add comment');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['healthPosts'] });
      setComment('');
      setIsCommenting(null);
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add comment",
        variant: "destructive"
      });
    }
  });

  // Filter posts
  const filteredPosts = healthPosts.filter(post => {
    // Search term filter
    const matchesSearch = !searchTerm || (
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Specialty filter
    const matchesSpecialty = !selectedSpecialty || post.doctor.specialty === selectedSpecialty;

    // Content type filter
    const matchesType = !selectedFilter || post.category === selectedFilter;

    return matchesSearch && matchesSpecialty && matchesType;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / itemsPerPage));
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCreatePost = () => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please login to create posts",
        variant: "destructive"
      });
      return;
    }
    setShowCreateDialog(true);
  };

  const handlePostSuccess = () => {
    // Close the dialog
    setShowCreateDialog(false);
    
    // Refetch posts to show the new one
    refetch();
    
    // Show success message
    toast({
      title: "Success",
      description: "Post created successfully",
    });
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleLike = (postId: string) => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please login to like posts",
        variant: "destructive"
      });
      return;
    }

    // Optimistically update the UI immediately
    setOptimisticLikes(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));

    likeMutation.mutate({ postId });
  };

  const handleComment = (postId: string) => {
    if (!comment.trim()) return;
    
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please login to comment",
        variant: "destructive"
      });
      return;
    }

    commentMutation.mutate({ postId, content: comment });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-10">
          <h1 className="text-4xl font-bold text-center mb-2">Healthy Talk</h1>
          <p className="text-xl text-muted-foreground text-center max-w-2xl">
            Expert medical insights, tips, and discussions from our community of healthcare professionals and patients
          </p>
          
          <div className="flex w-full max-w-lg mt-6 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search articles..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>Search</Button>
            <Button onClick={handleCreatePost} className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Create Post
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Filters Section */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Category Filter */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="font-semibold text-lg mb-4">Filter by Category</h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value="all"
                      checked={!selectedFilter}
                      onChange={() => setSelectedFilter(null)}
                      className="w-4 h-4 text-primary"
                    />
                    <span>All Categories</span>
                  </label>
                  
                  <label className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value="Articles"
                      checked={selectedFilter === 'Articles'}
                      onChange={() => setSelectedFilter('Articles')}
                      className="w-4 h-4 text-primary"
                    />
                    <span>Articles</span>
                  </label>
                  
                  <label className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value="Case Studies"
                      checked={selectedFilter === 'Case Studies'}
                      onChange={() => setSelectedFilter('Case Studies')}
                      className="w-4 h-4 text-primary"
                    />
                    <span>Case Studies</span>
                  </label>
                  
                  <label className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value="Research"
                      checked={selectedFilter === 'Research'}
                      onChange={() => setSelectedFilter('Research')}
                      className="w-4 h-4 text-primary"
                    />
                    <span>Research</span>
                  </label>
                </div>
              </div>

              {/* Clear Filter Button */}
              <button
                onClick={() => {
                  setSelectedFilter(null);
                  setSearchTerm('');
                }}
                className="w-full px-4 py-2 text-center border rounded-md hover:bg-accent transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
          
          {/* Posts Section */}
          <div className="lg:col-span-9">
            {isLoadingPosts ? (
              <div className="flex justify-center">
                <p>Loading posts...</p>
              </div>
            ) : postsError ? (
              <div className="text-red-500">
                <p>Error loading posts. Please try again later.</p>
                <p>{postsError instanceof Error ? postsError.message : String(postsError)}</p>
              </div>
            ) : paginatedPosts.length > 0 ? (
              <>
                <div className="space-y-8">
                  {paginatedPosts.map((post) => (
                    <Card key={post.id} className="overflow-hidden transition-shadow duration-300 hover:shadow-lg">
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
                        
                        {post.tags.length > 0 && (
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
                              className="flex items-center gap-1 group"
                              onClick={() => handleLike(post.id)}
                              disabled={likeMutation.isPending}
                            >
                              <Heart 
                                className={`h-4 w-4 transition-all duration-300 ease-in-out transform
                                  ${(optimisticLikes[post.id] ?? post.likes.includes(currentUser?.id || ''))
                                    ? 'fill-primary text-primary scale-110' 
                                    : 'scale-100 hover:scale-110'
                                  } 
                                  ${likeMutation.isPending ? 'opacity-50' : 'opacity-100'}
                                `}
                              />
                              <span className="transition-all duration-300">
                                {post.likes.length + (
                                  optimisticLikes[post.id] && !post.likes.includes(currentUser?.id || '') ? 1 :
                                  !optimisticLikes[post.id] && post.likes.includes(currentUser?.id || '') ? -1 : 
                                  0
                                )}
                              </span>
                            </Button>
                            
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="flex items-center gap-1"
                              onClick={() => setIsCommenting(isCommenting === post.id ? null : post.id)}
                            >
                              <MessageSquare className="h-4 w-4" />
                              <span>{post.comments.length}</span>
                            </Button>
                          </div>
                        </div>
                        
                        {isCommenting === post.id && (
                          <div className="w-full flex gap-2 mb-4">
                            <Textarea 
                              placeholder="Write a comment..." 
                              className="min-h-[80px]" 
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                            />
                            <Button 
                              className="self-end"
                              onClick={() => handleComment(post.id)}
                              disabled={commentMutation.isPending}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        
                        {post.comments.length > 0 && (
                          <div className="w-full space-y-3">
                            {post.comments.slice(0, 2).map((comment) => (
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
                              <Link 
                                to={`/healthy-talk/${post.id}`}
                                className="text-sm text-primary hover:underline block text-center"
                              >
                                View all {post.comments.length} comments
                              </Link>
                            )}
                          </div>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <Button
                        key={i + 1}
                        variant={currentPage === i + 1 ? "default" : "outline"}
                        className="mx-1"
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </Button>
                ))}
              </div>
                )}
              </>
            ) : (
              <div className="text-center py-10 bg-accent rounded-lg">
                <h3 className="font-semibold text-xl">No posts found</h3>
                <p className="text-muted-foreground mt-2">Try adjusting your filter</p>
              </div>
            )}
          </div>
        </div>

        {/* Add CreatePostDialog */}
        <CreatePostDialog 
          isOpen={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onSuccess={handlePostSuccess}
        />
      </div>
    </Layout>
  );
};

export default HealthyTalk;
