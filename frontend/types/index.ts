// Shared TypeScript types for Learnova AI

export type UserRole = "student" | "instructor" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: { url: string; publicId: string };
  bio?: string;
  title?: string;
  isBlocked?: boolean;
  studyStreak?: number;
  lastActiveDate?: string;
  preferences?: { darkMode?: boolean; emailNotifications?: boolean };
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  courseCount?: number;
}

export interface Course {
  _id: string;
  title: string;
  slug?: string;
  description: string;
  shortDescription?: string;
  instructor: User | string;
  category?: Category | string;
  thumbnail: { url: string; publicId: string };
  price: number;
  isFree: boolean;
  level: "beginner" | "intermediate" | "advanced";
  language?: string;
  tags?: string[];
  isPublished?: boolean;
  isApproved?: boolean;
  approvalStatus?: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  rating: number;
  numReviews: number;
  numStudents: number;
  duration?: number;
  createdAt?: string;
}

export interface Resource {
  name: string;
  url: string;
  publicId: string;
  type: string;
  size: number;
}

export interface Lesson {
  _id: string;
  section: string;
  course: string;
  title: string;
  description?: string;
  content?: string;
  video: { url: string; publicId: string; duration: number };
  resources: Resource[];
  order: number;
  isPreview: boolean;
}

export interface Section {
  _id: string;
  course: string;
  title: string;
  order: number;
  lessons?: Lesson[];
}

export interface Enrollment {
  _id: string;
  student: string | User;
  course: Course;
  progress: number;
  completedLessons: string[];
  lastLesson?: Lesson | string;
  isCompleted: boolean;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Assignment {
  _id: string;
  course: string | Course;
  instructor: User | string;
  title: string;
  description: string;
  instructions?: string;
  attachments: Resource[];
  maxMarks: number;
  deadline: string;
  isPublished?: boolean;
  numSubmissions?: number;
  createdAt?: string;
  submission?: AssignmentSubmission | null;
}

export interface AssignmentSubmission {
  _id: string;
  assignment: string | Assignment;
  student: User | string;
  course: string | Course;
  content: string;
  attachments: Resource[];
  status: "submitted" | "graded" | "late" | "resubmitted";
  isLate: boolean;
  marks: number | null;
  feedback: string;
  gradedBy?: User | string;
  gradedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuizQuestion {
  _id?: string;
  question: string;
  options: string[];
  correctAnswer?: number;
  explanation?: string;
}

export interface Quiz {
  _id: string;
  title: string;
  description?: string;
  course?: string | Course;
  owner?: User | string;
  type?: "manual" | "ai-generated";
  topic?: string;
  difficulty: "easy" | "medium" | "hard";
  questions: QuizQuestion[];
  duration: number;
  passScore: number;
  isPublished?: boolean;
  createdAt?: string;
}

export interface QuizAttempt {
  _id: string;
  quiz: string | Quiz;
  student?: User | string;
  answers: { questionId: string; selectedOption: number; isCorrect: boolean }[];
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  timeSpent: number;
  createdAt?: string;
}

export interface AIConversation {
  _id: string;
  title: string;
  messages: { role: "user" | "assistant"; content: string; _id?: string; createdAt?: string }[];
  course?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AINote {
  _id: string;
  title: string;
  originalContent?: string;
  summary: string;
  keyPoints: string[];
  takeaways: string[];
  noteType: "summary" | "notes" | "revision" | "takeaways";
  course?: Course | string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Flashcard {
  _id?: string;
  front: string;
  back: string;
}

export interface FlashcardSet {
  _id: string;
  title: string;
  description?: string;
  topic?: string;
  course?: Course | string;
  cards: Flashcard[];
  sessionsCompleted: number;
  lastStudiedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  _id: string;
  course: string | Course;
  student: string | User;
  rating: number;
  comment: string;
  createdAt?: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  sender?: User | null;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  unreadCount?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: Pagination;
}
