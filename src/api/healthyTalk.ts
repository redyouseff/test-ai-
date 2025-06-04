import { DoctorProfile } from "@/types";
import { mockDoctors } from "@/data/mockData";
import { HealthPost, Comment, CommentForm, ConsultationRequest } from "@/types/healthyTalk";
import { getApiUrl } from './config';

// Mock database for health posts
let healthPosts: HealthPost[] = [
  {
    id: "post1",
    title: "Understanding Seasonal Allergies",
    content: "Seasonal allergies, also known as hay fever or allergic rhinitis, affect millions of people worldwide. They occur when your immune system reacts to an outdoor allergen, such as pollen.\n\nSymptoms often include sneezing, congestion, runny nose, and itchy or watery eyes. While these symptoms may make you miserable, they aren't serious.\n\nMedications can help ease symptoms, and lifestyle changes like staying indoors on high-pollen days can help reduce exposure to allergens.",
    publishedAt: "2025-03-15T12:00:00Z",
    doctor: {
      id: "doctor1",
      name: "Sarah Johnson",
      specialty: "Allergy and Immunology",
      profileImage: "https://randomuser.me/api/portraits/women/42.jpg"
    },
    likes: ["user1", "user3"],
    comments: [
      {
        id: "comment1",
        postId: "post1",
        user: {
          id: "user1",
          name: "Michael Brown",
          profileImage: "https://randomuser.me/api/portraits/men/32.jpg"
        },
        content: "This is very helpful! I've been struggling with allergies this spring.",
        createdAt: "2025-03-16T09:30:00Z",
        likes: 2
      }
    ],
    tags: ["allergies", "seasonal", "health tips"],
    readingTime: 4
  },
  {
    id: "post2",
    title: "The Importance of Sleep for Mental Health",
    content: "Sleep and mental health are closely connected. Sleep deprivation affects your psychological state and mental health. Those with mental health problems are more likely to have insomnia or other sleep disorders.\n\nChronic sleep problems affect 50% to 80% of patients in a typical psychiatric practice, compared with 10% to 18% of adults in the general U.S. population.\n\nGetting enough quality sleep is essential for maintaining good mental health. Aim for 7-9 hours of sleep per night.",
    publishedAt: "2025-03-10T15:30:00Z",
    doctor: {
      id: "doctor2",
      name: "Robert Chen",
      specialty: "Psychiatry",
      profileImage: "https://randomuser.me/api/portraits/men/45.jpg"
    },
    likes: ["user2"],
    comments: [
      {
        id: "comment2",
        postId: "post2",
        user: {
          id: "user2",
          name: "Jennifer Adams",
          profileImage: "https://randomuser.me/api/portraits/women/22.jpg"
        },
        content: "This explains a lot about why my mood changes when I don't get enough sleep.",
        createdAt: "2025-03-10T18:15:00Z",
        likes: 5
      },
      {
        id: "comment3",
        postId: "post2",
        user: {
          id: "user3",
          name: "David Wilson",
          profileImage: "https://randomuser.me/api/portraits/men/55.jpg"
        },
        content: "Do you have any tips for improving sleep quality?",
        createdAt: "2025-03-11T10:45:00Z",
        likes: 1
      }
    ],
    tags: ["sleep", "mental health", "wellness"],
    readingTime: 5
  },
  {
    id: "post3",
    title: "Nutrition Basics: Building a Balanced Diet",
    content: "A balanced diet gives your body the nutrients it needs to function correctly. To get the nutrition you need, most of your daily calories should come from fresh fruits, fresh vegetables, whole grains, legumes, nuts, and lean proteins.\n\nTry to limit highly processed foods, which often contain added sugar, salt, and unhealthy fats. These foods can contribute to various health issues including obesity, heart disease, and type 2 diabetes.\n\nRemember that nutrition needs vary for each person depending on age, sex, activity level, and medical conditions.",
    publishedAt: "2025-02-28T09:45:00Z",
    doctor: {
      id: "doctor3",
      name: "Melissa Garcia",
      specialty: "Nutrition",
      profileImage: "https://randomuser.me/api/portraits/women/29.jpg"
    },
    likes: ["user1", "user2", "user3"],
    comments: [],
    tags: ["nutrition", "diet", "health"],
    coverImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    readingTime: 6
  }
];

interface ApiHealthPost {
  _id: string;
  author: {
    _id: string;
    fullName: string;
    specialty: {
      _id: string;
      name: string;
    }
  };
  title: string;
  content: string;
  category: string;
  tags: string[];
  likes: string[];
  image?: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface HealthPost {
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
  comments: Comment[];
  tags?: string[];
  coverImage?: string;
  readingTime?: number;
  category?: string;
}

const transformApiResponse = (post: any): HealthPost => {
  // Handle tags that might be a comma-separated string in an array
  const tagsArray = Array.isArray(post.tags) 
    ? post.tags.flatMap(tag => 
        typeof tag === 'string' 
          ? tag.split(',').map(t => t.trim())
          : tag
      )
    : [];

  return {
    id: post._id,
    title: post.title,
    content: post.content,
    publishedAt: post.createdAt,
    doctor: {
      id: post.author._id,
      name: post.author.fullName,
      specialty: post.author.specialty?.name || 'General',
      profileImage: undefined
    },
    likes: Array.isArray(post.likes) ? post.likes : [],
    comments: Array.isArray(post.comments) 
      ? post.comments.map(comment => ({
          id: comment._id,
          postId: post._id,
          user: {
            id: comment.user._id,
            name: comment.user.fullName,
            profileImage: comment.user.profileImage
          },
          content: comment.text,
          createdAt: comment.createdAt,
          likes: 0
        }))
      : [],
    tags: tagsArray,
    coverImage: post.image,
    readingTime: Math.ceil(post.content.split(' ').length / 200)
  };
};

interface HealthPostsFilters {
  keyword?: string;
  category?: string;
  tags?: string;
  page?: number;
  limit?: number;
  specialtyId?: string | null;
  doctorId?: string | null;
}

// Mock fetch functions
export const fetchHealthPosts = async (
  filters: { specialtyId?: string | null; doctorId?: string | null } = {}
): Promise<HealthPost[]> => {
  try {
    const url = new URL(getApiUrl('/health-talks'));
    
    if (filters.specialtyId) {
      url.searchParams.append('specialty', filters.specialtyId);
    }
    if (filters.doctorId) {
      url.searchParams.append('doctor', filters.doctorId);
    }

    console.log('Fetching from URL:', url.toString());

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || `Failed to fetch health talks: ${response.status}`
      );
    }

    const responseData = await response.json();
    console.log('Raw API Response:', responseData);

    if (!responseData.data || !Array.isArray(responseData.data)) {
      console.error('Unexpected API response structure:', responseData);
      return [];
    }

    const transformedPosts = responseData.data.map(transformApiResponse);
    console.log('Transformed Posts:', transformedPosts);
    
    return transformedPosts;
  } catch (error) {
    console.error('Error fetching health talks:', error);
    throw error;
  }
};

export const fetchPostById = async (postId: string): Promise<HealthPost | null> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const post = healthPosts.find(p => p.id === postId);
  return post || null;
};

export const fetchSpecialties = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Extract unique specialties from mock doctors
  const specialties = Array.from(new Set(mockDoctors.map(doctor => 
    doctor.specialty
  ))).map((specialty, index) => ({
    id: specialty,
    name: specialty,
    description: `${specialty} related posts`,
    icon: `specialty-icon-${index}`
  }));
  
  return specialties;
};

export const fetchDoctors = async (specialtyId: string | null = null) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  let filteredDoctors = [...mockDoctors];
  
  if (specialtyId) {
    filteredDoctors = filteredDoctors.filter(doctor => doctor.specialty === specialtyId);
  }
  
  // Return only what we need for the UI
  return filteredDoctors.map(doctor => ({
    id: doctor.id,
    name: doctor.name,
    specialty: doctor.specialty,
    profileImage: doctor.profileImage
  }));
};

export const likePost = async ({ postId, userId }: { postId: string, userId: string }): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const post = healthPosts.find(p => p.id === postId);
  if (!post) throw new Error("Post not found");
  
  const hasLiked = post.likes.includes(userId);
  
  if (hasLiked) {
    post.likes = post.likes.filter(id => id !== userId);
  } else {
    post.likes.push(userId);
  }
};

export const commentOnPost = async (commentData: CommentForm): Promise<Comment> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const post = healthPosts.find(p => p.id === commentData.postId);
  if (!post) throw new Error("Post not found");
  
  const user = mockDoctors.find(d => d.id === commentData.userId) || {
    id: commentData.userId,
    name: "Anonymous User",
    profileImage: ""
  };
  
  const newComment: Comment = {
    id: `comment-${Date.now()}`,
    postId: commentData.postId,
    user: {
      id: user.id,
      name: user.name,
      profileImage: user.profileImage || ""
    },
    content: commentData.content,
    createdAt: new Date().toISOString(),
    likes: 0
  };
  
  post.comments.push(newComment);
  return newComment;
};

export const requestConsultation = async (
  request: ConsultationRequest
): Promise<{ success: boolean, message: string }> => {
  await new Promise(resolve => setTimeout(resolve, 700));
  
  // In a real app, this would create an appointment request
  return { 
    success: true, 
    message: "Consultation request sent successfully" 
  };
};
