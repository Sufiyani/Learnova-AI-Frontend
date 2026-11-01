# Learnova AI — AI-Powered Learning Management System

A complete, production-quality LMS with AI-powered learning tools, built with Next.js (TypeScript), Express.js, MongoDB, Cloudinary, and OpenAI-compatible AI integration.

## Features

### For Students
- **Dashboard** — personalized greeting, enrolled courses, continue learning, progress tracking, study streak, recent activity, learning stats
- **Course Management** — browse, search, filter, enroll, watch videos, download resources, track progress, mark lessons complete, review courses
- **AI Learning Assistant** — interactive chat with AI for explanations, examples, practice questions, and personalized suggestions
- **AI Quiz Generator** — generate quizzes from any topic, take quizzes, view results with explanations, track history
- **AI Notes & Summarization** — summarize content, extract key points, generate revision notes, save and organize
- **AI Flashcards** — generate flashcards, study with flip-card interaction, track sessions
- **Assignments** — view assignments, submit files, view grades and feedback
- **Learning Analytics** — course progress, quiz performance, assignment stats, weekly activity, study streak
- **Notifications** — enrollment alerts, assignment deadlines, grading updates, announcements

### For Instructors
- **Dashboard** — course stats, student count, ratings, pending submissions, recent enrollments
- **Course Management** — create, edit, delete courses; upload thumbnails; manage sections and lessons; upload videos and resources
- **Assignment Management** — create assignments, view submissions, grade with feedback
- **Quiz Management** — create manual quizzes with MCQs, view student attempts and results
- **Student Monitoring** — view enrolled students, track progress, see completion status

### For Admins
- **Dashboard** — platform stats, user counts, course stats, recent activity
- **User Management** — view all users, search, filter by role, block/unblock, delete
- **Course Management** — view all courses, approve/reject instructor submissions, delete courses
- **Category Management** — create, edit, delete course categories
- **Settings** — profile management, password change

### Platform Features
- JWT authentication with role-based authorization (student, instructor, admin)
- Cloudinary for all file uploads (images, videos, documents)
- Light and dark mode
- Responsive design (mobile, tablet, desktop)
- Toast notifications, loading skeletons, empty states, confirmation dialogs
- In-app notification system with read/unread status

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js, JavaScript (ES Modules) |
| Database | MongoDB with Mongoose ODM |
| File Storage | Cloudinary |
| AI | OpenAI-compatible API |
| Charts | Recharts |
| Icons | Lucide React |
| Auth | JWT, bcryptjs |

## Project Structure

```
Learnova-AI/
├── frontend/          # Next.js (TypeScript) frontend
│   ├── app/           # App Router pages
│   ├── components/    # Reusable React components
│   ├── context/       # React contexts (Auth)
│   ├── services/      # Centralized API client
│   └── types/         # TypeScript type definitions
├── backend/           # Express.js (JavaScript) backend
│   ├── src/
│   │   ├── config/    # Database & Cloudinary config
│   │   ├── controllers/ # API controllers
│   │   ├── models/    # Mongoose models
│   │   ├── routes/    # Express routes
│   │   ├── middleware/ # Auth, error, validation
│   │   ├── services/  # AI & Cloudinary services
│   │   ├── utils/     # Helpers & seeder
│   │   └── app.js     # Express app
│   ├── server.js      # Entry point
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js 18+ installed
- MongoDB running locally or a MongoDB Atlas connection string
- A Cloudinary account (free tier works)
- An AI API key (OpenAI or any OpenAI-compatible API)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Backend
cd Learnova-AI/backend
npm install

# Frontend
cd Learnova-AI/frontend
npm install
```

### 2. Environment Variables

#### Backend (`backend/.env`)

Copy `backend/.env.example` to `backend/.env` and fill in:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/learnova_ai
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GEMINI_API_KEY=your_gemini_api_key_here
CLIENT_URL=http://localhost:3000
```

#### Frontend (`frontend/.env.local`)

Copy `frontend/.env.local.example` to `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Database Setup

1. Ensure MongoDB is running (local or Atlas)
2. Seed initial categories and an admin user:

```bash
cd backend
npm run seed
```

This creates:
- 10 default course categories (Web Development, Data Science, etc.)
- An admin user: `admin@learnova.ai` / `admin123456`

### 4. Run the Application

#### Start the Backend

```bash
cd backend
npm run dev
```

The API server runs on `http://localhost:5000`.

#### Start the Frontend

```bash
cd frontend
npm run dev
```

The frontend runs on `http://localhost:3000`.

### 5. Access the Application

- Visit `http://localhost:3000` for the landing page
- Click "Get Started" to register as a student or instructor
- Admin login: `admin@learnova.ai` / `admin123456`

## API Overview

### Authentication
- `POST /api/auth/register` — Register (student or instructor)
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user
- `POST /api/auth/forgot-password` — Request reset token
- `POST /api/auth/reset-password` — Reset password with token
- `PUT /api/auth/change-password` — Change password (authenticated)

### Courses
- `GET /api/courses` — List courses (with search, filters, pagination)
- `GET /api/courses/:id` — Get course detail with curriculum
- `POST /api/courses` — Create course (instructor/admin)
- `PUT /api/courses/:id` — Update course
- `DELETE /api/courses/:id` — Delete course
- `POST /api/courses/:id/thumbnail` — Upload thumbnail
- `POST /api/courses/:id/sections` — Add section
- `POST /api/courses/:id/sections/:sectionId/lessons` — Add lesson
- `POST /api/courses/lessons/:lessonId/video` — Upload video
- `POST /api/courses/lessons/:lessonId/resources` — Upload resource
- `POST /api/courses/:id/review` — Add review

### Enrollments
- `POST /api/enrollments/:courseId` — Enroll in course
- `GET /api/enrollments` — Get my enrollments
- `PUT /api/enrollments/:courseId/lessons/:lessonId/complete` — Mark lesson complete

### Assignments & Submissions
- `GET /api/assignments/course/:courseId` — Get course assignments
- `POST /api/assignments/:courseId` — Create assignment (instructor)
- `POST /api/submissions/:assignmentId` — Submit assignment
- `PUT /api/submissions/:id/grade` — Grade submission (instructor)

### Quizzes
- `GET /api/quizzes` — List quizzes
- `POST /api/quizzes` — Create quiz (instructor)
- `POST /api/quizzes/:id/attempt` — Submit quiz attempt

### AI Features
- `POST /api/ai/chat` — Chat with AI assistant
- `GET /api/ai/conversations` — List conversations
- `POST /api/ai/generate-quiz` — Generate AI quiz
- `POST /api/ai/generate-notes` — Generate AI notes
- `POST /api/ai/generate-flashcards` — Generate AI flashcards
- `GET/PUT/DELETE /api/ai/notes` — Manage notes
- `GET/PUT/DELETE /api/ai/flashcards` — Manage flashcards

### Analytics
- `GET /api/analytics/student` — Student analytics
- `GET /api/analytics/instructor` — Instructor analytics

### Admin
- `GET /api/admin/stats` — Platform stats
- `GET /api/admin/users` — List users
- `PUT /api/admin/users/:id/block` — Block user
- `GET /api/admin/courses` — List all courses
- `PUT /api/admin/courses/:id/approve` — Approve course
- `PUT /api/admin/courses/:id/reject` — Reject course

### Categories
- `GET /api/categories` — List categories
- `POST /api/categories` — Create category (admin)
- `PUT /api/categories/:id` — Update category (admin)
- `DELETE /api/categories/:id` — Delete category (admin)

### Notifications
- `GET /api/notifications` — List notifications
- `PUT /api/notifications/read-all` — Mark all as read
- `PUT /api/notifications/:id/read` — Mark as read

## Security Features

- JWT-based authentication with httpOnly cookie support
- Password hashing with bcryptjs
- Role-based access control (student, instructor, admin)
- Input validation with express-validator
- Rate limiting on auth and API endpoints
- Helmet for HTTP security headers
- CORS configuration
- Cloudinary file type and size validation
- API keys stored only in backend environment variables

## AI Integration

The AI service (`backend/src/services/aiService.js`) integrates with any OpenAI-compatible API:

- **Learning Assistant** — Context-aware educational chat with conversation history
- **Quiz Generator** — Generates MCQs with explanations from any topic
- **Notes Summarizer** — Extracts summaries, key points, and takeaways from text
- **Flashcard Generator** — Creates Q&A flashcards from topics or text

Configure with `AI_API_KEY`, `AI_API_URL`, and `AI_MODEL` environment variables.

## Database Models

User, Course, Category, Section, Lesson, Enrollment, Assignment, AssignmentSubmission, Quiz, QuizAttempt, Review, Notification, AIConversation, AINote, FlashcardSet, LearningActivity

All models include proper relationships (Mongoose refs), validation, timestamps, and indexes.

## Building for Production

```bash
# Frontend
cd frontend
npm run build
npm start

# Backend
cd backend
npm start
```

## License

This project is for educational purposes.

