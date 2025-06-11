import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Heart,
  MessageSquare,
  Clock,
  Calendar,
  Send,
  Share,
  ThumbsUp,
  ArrowLeft,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/types";
import { toast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getApiUrl } from "@/lib/utils";

interface HealthPost {
  id: string;
  title: string;
  content: string;
  category: "Articles" | "Case Studies" | "Research";
  tags: string[];
  image?: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    fullName: string;
    profileImage?: string;
    specialty: {
      id: string;
      name: string;
    };
  };
  likes: Array<{
    id: string;
    fullName: string;
    profileImage?: string;
  }>;
  comments: Array<{
    id: string;
    user: {
      id: string;
      fullName: string;
      profileImage?: string;
    };
    text: string;
    createdAt: string;
  }>;
}

interface ApiLike {
  _id: string;
  fullName: string;
  profileImage?: string;
}

interface ApiComment {
  _id: string;
  text: string;
  createdAt: string;
  user: {
    _id: string;
    fullName: string;
    profileImage?: string;
  };
}

const HealthPostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();

  const {
    data: post,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["healthPost", id],
    queryFn: async () => {
      try {
        console.log("Fetching post with ID:", id);
        const response = await fetch(getApiUrl(`/api/v1/health-talks/${id}`));

        if (!response.ok) {
          console.error("API Response not OK:", response.status);
          throw new Error("Failed to fetch post");
        }

        const data = await response.json();
        console.log("Raw API Response:", data);

        if (data.status === "success") {
          // Transform the data to match our interface
          const transformedPost = {
            id: data.data._id,
            title: data.data.title,
            content: data.data.content,
            category: data.data.category,
            tags: Array.isArray(data.data.tags)
              ? data.data.tags[0].split(",").map((tag: string) => tag.trim())
              : [],
            image: data.data.image,
            createdAt: data.data.createdAt || new Date().toISOString(),
            updatedAt: data.data.updatedAt || new Date().toISOString(),
            author: {
              id: data.data.author._id,
              fullName: data.data.author.fullName || "Unknown Author",
              profileImage: data.data.author.profileImage,
              specialty: {
                id: data.data.author.specialty?._id || "",
                name:
                  data.data.author.specialty?.name || "Healthcare Professional",
              },
            },
            likes: (data.data.likes || []).map((like: ApiLike) => ({
              id: like._id,
              fullName: like.fullName,
              profileImage: like.profileImage,
            })),
            comments: (data.data.comments || []).map((comment: ApiComment) => ({
              id: comment._id,
              user: {
                id: comment.user._id,
                fullName: comment.user.fullName,
                profileImage: comment.user.profileImage,
              },
              text: comment.text,
              createdAt: comment.createdAt || new Date().toISOString(),
            })),
          };
          console.log("Transformed Post:", transformedPost);
          return transformedPost;
        }
        throw new Error(data.message || "Failed to load post details");
      } catch (error) {
        console.error("Error fetching post:", error);
        throw error;
      }
    },
    enabled: !!id,
    retry: 1,
  });

  // Add debug logs for render conditions
  console.log("Current post state:", { isLoading, error, post });

  const isLikedByCurrentUser = post?.likes.some(
    (like) => like.id === currentUser?.id
  );

  const likeMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(
        getApiUrl(`/api/v1/health-talks/${id}/like`),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to like post");
      return response.json();
    },
    onSuccess: (data) => {
      if (data.status === "success") {
        queryClient.invalidateQueries({ queryKey: ["healthPost", id] });
        toast({
          title: "Success",
          description: "Post liked successfully",
        });
      }
    },
    onError: (error) => {
      console.error("Like error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to like post",
        variant: "destructive",
      });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(
        getApiUrl(`/api/v1/health-talks/${id}/comments`),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: comment }),
        }
      );
      if (!response.ok) throw new Error("Failed to add comment");
      return response.json();
    },
    onSuccess: (data) => {
      if (data.status === "success") {
        setComment("");
        queryClient.invalidateQueries({ queryKey: ["healthPost", id] });
        toast({
          title: "Success",
          description: "Comment added successfully",
        });
      }
    },
    onError: (error) => {
      console.error("Comment error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to add comment",
        variant: "destructive",
      });
    },
  });

  const handleLike = () => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please login to like posts",
        variant: "destructive",
      });
      return;
    }
    likeMutation.mutate();
  };

  const handleComment = () => {
    if (!comment.trim()) return;

    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please login to comment",
        variant: "destructive",
      });
      return;
    }

    commentMutation.mutate();
  };

  // Show loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Show error state
  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Error Loading Post
            </h2>
            <p className="text-gray-600">
              {error instanceof Error
                ? error.message
                : "Failed to load post details"}
            </p>
            <Button
              variant="outline"
              onClick={() => navigate("/healthy-talk")}
              className="mt-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Healthy Talk
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Show not found state
  if (!post) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Post Not Found
            </h2>
            <p className="text-gray-600">
              The post you're looking for doesn't exist or has been removed.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate("/healthy-talk")}
              className="mt-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Healthy Talk
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate("/healthy-talk")}>
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
                  <AvatarFallback>
                    {post.author.fullName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{post.author.fullName}</p>
                  <p className="text-sm text-gray-500">
                    {post.author.specialty.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-1" />
                {format(new Date(post.createdAt), "MMM d, yyyy")}
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">{post.category}</Badge>
                {post.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="prose max-w-none">{post.content}</div>
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
                      isLikedByCurrentUser ? "fill-primary text-primary" : ""
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
                  <Textarea
                    placeholder="Write a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <Button
                    className="self-start"
                    onClick={handleComment}
                    disabled={commentMutation.isPending || !comment.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4 mt-6">
                  {post.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="flex gap-3 p-4 bg-gray-50 rounded-lg"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.user.profileImage} />
                        <AvatarFallback>
                          {comment.user.fullName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {comment.user.fullName}
                          </span>
                          <span className="text-sm text-gray-500">
                            {format(new Date(comment.createdAt), "MMM d, yyyy")}
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
