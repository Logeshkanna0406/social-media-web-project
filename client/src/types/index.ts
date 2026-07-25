export type Role = 'USER' | 'RECRUITER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  fullName: string;
  headline?: string;
  role: Role;
  isVerified?: boolean;
  avatarUrl?: string;
  coverUrl?: string;
  createdAt: string;
  mutualConnections?: number;
}

export interface Skill {
  id: string;
  name: string;
  level?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  description?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string | null;
}

export interface Profile {
  bio?: string;
  location?: string;
  websiteUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  resumeUrl?: string;
  resumeScore?: number;
  skills: Skill[];
  experiences: Experience[];
  education: Education[];
}

export interface PollOption {
  id: string;
  text: string;
  votesCount: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  userVotedOptionId?: string | null;
}

export interface Comment {
  id: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  author: {
    id: string;
    fullName: string;
    headline?: string;
    avatarUrl?: string;
  };
  content: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  hashtags?: string[];
  isAiGenerated?: boolean;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  poll?: Poll | null;
  comments?: Comment[];
  createdAt: string;
}

export interface Job {
  id: string;
  title: string;
  companyName: string;
  companyLogo?: string;
  location: string;
  jobType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'REMOTE';
  isRemote: boolean;
  salaryRange?: string;
  description: string;
  requirements?: string[];
  postedAt: string;
  applicantCount: number;
  isSaved?: boolean;
}

export interface Message {
  id: string;
  channelId?: string | null;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  receiverId?: string | null;
  content: string;
  imageUrl?: string | null;
  createdAt: string;
}

export interface AIReviewResult {
  score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  suggestedKeywords: string[];
}
