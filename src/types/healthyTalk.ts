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
  likes: string[]; // User IDs who liked the post
  comments: Comment[];
  tags?: string[];
  coverImage?: string;
  readingTime?: number;
}

export interface Comment {
  id: string;
  postId: string;
  user: {
    id: string;
    name: string;
    profileImage?: string;
  };
  content: string;
  createdAt: string;
  likes?: number;
}

export interface CommentForm {
  postId: string;
  userId: string;
  content: string;
}

export interface ConsultationRequest {
  doctorId: string;
  patientId: string;
  postId?: string;
  message?: string;
}
