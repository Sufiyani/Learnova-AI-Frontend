import axios from "axios";
import type {
  User,
  Course,
  Lesson,
  Enrollment,
  Assignment,
  AssignmentSubmission,
  Quiz,
  QuizAttempt,
  AIConversation,
  AINote,
  FlashcardSet,
  Notification,
  Category,
  AuthResponse,
  Pagination,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// --- Axios instance ---
const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("learnova_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 → logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const isAuthRoute = window.location.pathname.includes("/login") || window.location.pathname.includes("/register");
      if (!isAuthRoute) {
        localStorage.removeItem("learnova_token");
        localStorage.removeItem("learnova_user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Helper to extract error message
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || "Something went wrong";
  }
  return "Something went wrong";
}

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email: string; password: string; role: "student" | "instructor" }) =>
    api.post<{ data: AuthResponse }>("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post<{ data: AuthResponse }>("/auth/login", data),
  getMe: () => api.get<{ data: { user: User } }>("/auth/me"),
  logout: () => api.post("/auth/logout"),
  forgotPassword: (email: string) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token: string, password: string) =>
    api.post("/auth/reset-password", { token, password }),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put("/auth/change-password", { currentPassword, newPassword }),
};

// ─────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────
export const userApi = {
  getMe: () => api.get<{ data: { user: User } }>("/users/me"),
  updateProfile: (data: Partial<User>) => api.put("/users/me", data),
  updateAvatar: (file: { buffer: string; mimetype: string; originalname: string }) =>
    api.put("/users/me/avatar", { file }),
  getInstructor: (id: string) => api.get(`/users/instructor/${id}`),
  searchInstructors: (q: string) => api.get(`/users/search/instructors?q=${q}`),
};

// ─────────────────────────────────────────────
// COURSES
// ─────────────────────────────────────────────
export const courseApi = {
  list: (params?: Record<string, string | number | boolean>) =>
    api.get<{ data: { data: Course[] }; pagination: Pagination }>("/courses", { params }),
  getById: (id: string) => api.get(`/courses/${id}`),
  create: (data: Partial<Course>) => api.post("/courses", data),
  update: (id: string, data: Partial<Course>) => api.put(`/courses/${id}`, data),
  delete: (id: string) => api.delete(`/courses/${id}`),
  uploadThumbnail: (id: string, file: { buffer: string; mimetype: string; originalname: string }) =>
    api.post(`/courses/${id}/thumbnail`, { file }),
  submitForApproval: (id: string) => api.put(`/courses/${id}/submit`),
  getInstructorCourses: () => api.get("/courses/instructor/me"),
  addSection: (courseId: string, data: { title: string; order?: number }) =>
    api.post(`/courses/${courseId}/sections`, data),
  updateSection: (courseId: string, sectionId: string, data: { title?: string; order?: number }) =>
    api.put(`/courses/${courseId}/sections/${sectionId}`, data),
  deleteSection: (courseId: string, sectionId: string) =>
    api.delete(`/courses/${courseId}/sections/${sectionId}`),
  addLesson: (courseId: string, sectionId: string, data: Partial<Lesson>) =>
    api.post(`/courses/${courseId}/sections/${sectionId}/lessons`, data),
  updateLesson: (lessonId: string, data: Partial<Lesson>) =>
    api.put(`/courses/lessons/${lessonId}`, data),
  deleteLesson: (lessonId: string) => api.delete(`/courses/lessons/${lessonId}`),
  uploadLessonVideo: (lessonId: string, file: { buffer: string; mimetype: string; originalname: string }, duration?: number) =>
    api.post(`/courses/lessons/${lessonId}/video`, { file, duration }),
  uploadLessonResource: (lessonId: string, file: { buffer: string; mimetype: string; originalname: string }) =>
    api.post(`/courses/lessons/${lessonId}/resources`, { file }),
  deleteLessonResource: (lessonId: string, resourceIndex: number) =>
    api.delete(`/courses/lessons/${lessonId}/resources/${resourceIndex}`),
  addReview: (courseId: string, data: { rating: number; comment: string }) =>
    api.post(`/courses/${courseId}/review`, data),
};

// ─────────────────────────────────────────────
// ENROLLMENTS
// ─────────────────────────────────────────────
export const enrollmentApi = {
  enroll: (courseId: string) => api.post(`/enrollments/${courseId}`),
  getMyEnrollments: () => api.get<{ data: { data: Enrollment[] } }>("/enrollments"),
  getEnrollment: (courseId: string) => api.get(`/enrollments/${courseId}`),
  markLessonComplete: (courseId: string, lessonId: string) =>
    api.put(`/enrollments/${courseId}/lessons/${lessonId}/complete`),
  unmarkLessonComplete: (courseId: string, lessonId: string) =>
    api.put(`/enrollments/${courseId}/lessons/${lessonId}/incomplete`),
  getCourseEnrollments: (courseId: string) =>
    api.get(`/enrollments/instructor/${courseId}`),
};

// ─────────────────────────────────────────────
// LESSONS
// ─────────────────────────────────────────────
export const lessonApi = {
  getLesson: (lessonId: string) => api.get(`/lessons/${lessonId}`),
  updateProgress: (lessonId: string, position: number) =>
    api.put(`/lessons/${lessonId}/progress`, { position }),
};

// ─────────────────────────────────────────────
// ASSIGNMENTS & SUBMISSIONS
// ─────────────────────────────────────────────
export const assignmentApi = {
  getByCourse: (courseId: string) => api.get(`/assignments/course/${courseId}`),
  getById: (id: string) => api.get(`/assignments/${id}`),
  create: (courseId: string, data: Partial<Assignment> & { attachments?: any[] }) =>
    api.post(`/assignments/${courseId}`, data),
  update: (id: string, data: Partial<Assignment>) => api.put(`/assignments/${id}`, data),
  delete: (id: string) => api.delete(`/assignments/${id}`),
};

export const submissionApi = {
  submit: (assignmentId: string, data: { content: string; attachments?: any[] }) =>
    api.post(`/submissions/${assignmentId}`, data),
  getMySubmissions: () => api.get("/submissions/student/me"),
  getAssignmentSubmissions: (assignmentId: string) =>
    api.get(`/submissions/assignment/${assignmentId}`),
  grade: (submissionId: string, data: { marks: number; feedback: string }) =>
    api.put(`/submissions/${submissionId}/grade`, data),
};

// ─────────────────────────────────────────────
// QUIZZES
// ─────────────────────────────────────────────
export const quizApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<{ data: { data: Quiz[] }; pagination: Pagination }>("/quizzes", { params }),
  getById: (id: string) => api.get(`/quizzes/${id}`),
  getResults: (id: string) => api.get(`/quizzes/${id}/results`),
  submitAttempt: (id: string, data: { answers: { selectedOption: number }[]; timeSpent?: number }) =>
    api.post(`/quizzes/${id}/attempt`, data),
  getAttempts: (id: string) => api.get(`/quizzes/${id}/attempts`),
  getMyHistory: () => api.get("/quizzes/my/history"),
  create: (data: Partial<Quiz>) => api.post("/quizzes", data),
  update: (id: string, data: Partial<Quiz>) => api.put(`/quizzes/${id}`, data),
  delete: (id: string) => api.delete(`/quizzes/${id}`),
};

// ─────────────────────────────────────────────
// AI
// ─────────────────────────────────────────────
export const aiApi = {
  chat: (data: { conversationId?: string; message: string; courseContext?: string }) =>
    api.post("/ai/chat", data),
  getConversations: () => api.get("/ai/conversations"),
  getConversation: (id: string) => api.get(`/ai/conversations/${id}`),
  deleteConversation: (id: string) => api.delete(`/ai/conversations/${id}`),
  generateQuiz: (data: { topic: string; difficulty: string; numQuestions: number; saveQuiz?: boolean; courseId?: string }) =>
    api.post("/ai/generate-quiz", data),
  generateNotes: (data: { content: string; noteType: string; courseId?: string; title?: string }) =>
    api.post("/ai/generate-notes", data),
  getNotes: (params?: Record<string, string | number>) => api.get("/ai/notes", { params }),
  getNote: (id: string) => api.get(`/ai/notes/${id}`),
  updateNote: (id: string, data: Partial<AINote>) => api.put(`/ai/notes/${id}`, data),
  deleteNote: (id: string) => api.delete(`/ai/notes/${id}`),
  generateFlashcards: (data: { topicOrText: string; count?: number; courseId?: string; saveSet?: boolean; title?: string }) =>
    api.post("/ai/generate-flashcards", data),
  getFlashcardSets: (params?: Record<string, string | number>) => api.get("/ai/flashcards", { params }),
  getFlashcardSet: (id: string) => api.get(`/ai/flashcards/${id}`),
  createFlashcardSet: (data: { title: string; description?: string; topic?: string; courseId?: string; cards: { front: string; back: string }[] }) =>
    api.post("/ai/flashcards", data),
  updateFlashcardSet: (id: string, data: Partial<FlashcardSet>) => api.put(`/ai/flashcards/${id}`, data),
  deleteFlashcardSet: (id: string) => api.delete(`/ai/flashcards/${id}`),
  recordStudy: (id: string) => api.post(`/ai/flashcards/${id}/study`),
};

// ─────────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────────
export const analyticsApi = {
  getStudent: () => api.get("/analytics/student"),
  getInstructor: () => api.get("/analytics/instructor"),
};

// ─────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────
export const notificationApi = {
  list: (params?: Record<string, string | number | boolean>) => api.get("/notifications", { params }),
  getUnreadCount: () => api.get("/notifications/unread-count"),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put("/notifications/read-all"),
  delete: (id: string) => api.delete(`/notifications/${id}`),
  clearRead: () => api.delete("/notifications"),
};

// ─────────────────────────────────────────────
// ADMIN
// ─────────────────────────────────────────────
export const adminApi = {
  getStats: () => api.get("/admin/stats"),
  getUsers: (params?: Record<string, string | number | boolean>) =>
    api.get("/admin/users", { params }),
  blockUser: (id: string) => api.put(`/admin/users/${id}/block`),
  unblockUser: (id: string) => api.put(`/admin/users/${id}/unblock`),
  updateUserRole: (id: string, role: string) => api.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  getCourses: (params?: Record<string, string | number>) => api.get("/admin/courses", { params }),
  approveCourse: (id: string) => api.put(`/admin/courses/${id}/approve`),
  rejectCourse: (id: string, reason?: string) => api.put(`/admin/courses/${id}/reject`, { reason }),
  deleteCourse: (id: string) => api.delete(`/admin/courses/${id}`),
};

// ─────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────
export const categoryApi = {
  list: () => api.get("/categories"),
  create: (data: Partial<Category>) => api.post("/categories", data),
  update: (id: string, data: Partial<Category>) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// ─────────────────────────────────────────────
// FILE UPLOAD HELPER
// ─────────────────────────────────────────────
/**
 * Convert a File to base64 for sending to the backend (Cloudinary upload handled server-side).
 */
export function fileToBase64(file: File): Promise<{ buffer: string; mimetype: string; originalname: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve({ buffer: base64, mimetype: file.type, originalname: file.name });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default api;
