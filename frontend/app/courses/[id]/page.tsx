"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star,
  Users,
  Clock,
  BookOpen,
  PlayCircle,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronUp,
  Bot,
} from "lucide-react";
import { courseApi, enrollmentApi, getErrorMessage } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { FullPageSpinner } from "@/components/ui/Spinner";
import ProgressBar from "@/components/ui/ProgressBar";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import type { Course, Section, Review, Enrollment } from "@/types";
import toast from "react-hot-toast";

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { user } = useAuth();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [instructor, setInstructor] = useState<any>(null);
  const [curriculum, setCurriculum] = useState<Section[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [showEnrollConfirm, setShowEnrollConfirm] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const res = await courseApi.getById(id);
      setCourse(res.data.data.course);
      setInstructor(res.data.data.course.instructor);
      setCurriculum(res.data.data.curriculum || []);
      setEnrollment(res.data.data.enrollment);
      setReviews(res.data.data.reviews || []);
      // Expand first section by default
      if (res.data.data.curriculum?.length > 0) {
        setExpandedSections({ [res.data.data.curriculum[0]._id]: true });
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setEnrolling(true);
    try {
      await enrollmentApi.enroll(id);
      toast.success("Enrolled successfully!");
      setShowEnrollConfirm(false);
      fetchCourse();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setEnrolling(false);
    }
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await courseApi.addReview(id, { rating: reviewRating, comment: reviewComment });
      toast.success("Review submitted!");
      setReviewComment("");
      fetchCourse();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  if (loading) return <FullPageSpinner />;
  if (!course) return <div className="p-8 text-center text-slate-500">Course not found.</div>;

  const totalLessons = curriculum.reduce((sum, s) => sum + (s.lessons?.length || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Top nav */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-slate-100">Learnova AI</span>
          </Link>
          <Link href="/courses" className="btn-ghost text-sm">← Back to Courses</Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course header */}
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="badge bg-brand-100 text-brand-700 dark:bg-brand-950/30 dark:text-brand-400">
                  {course.level}
                </span>
                {course.isFree ? (
                  <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">Free</span>
                ) : (
                  <span className="badge bg-slate-900 text-white">${course.price}</span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{course.title}</h1>
              <p className="mt-3 text-slate-600 dark:text-slate-400">{course.description}</p>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {course.rating || 0} ({course.numReviews} reviews)
                </div>
                <div className="flex items-center gap-1">
                  <Users size={16} /> {course.numStudents} students
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen size={16} /> {totalLessons} lessons
                </div>
              </div>

              {instructor && (
                <div className="mt-4 flex items-center gap-3">
                  {instructor.avatar?.url ? (
                    <img src={instructor.avatar.url} alt={instructor.name} className="h-10 w-10 rounded-full" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                      {instructor.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{instructor.name}</p>
                    {instructor.title && <p className="text-xs text-slate-500">{instructor.title}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail */}
            {course.thumbnail?.url && (
              <div className="overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                <img src={course.thumbnail.url} alt={course.title} className="h-64 w-full object-cover sm:h-80" />
              </div>
            )}

            {/* Curriculum */}
            <div>
              <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-slate-100">Course Curriculum</h2>
              {curriculum.length === 0 ? (
                <p className="text-sm text-slate-500">No curriculum content yet.</p>
              ) : (
                <div className="space-y-2">
                  {curriculum.map((section) => (
                    <div key={section._id} className="card overflow-hidden">
                      <button
                        onClick={() => toggleSection(section._id)}
                        className="flex w-full items-center justify-between px-4 py-3 text-left"
                      >
                        <div>
                          <h3 className="font-medium text-slate-900 dark:text-slate-100">{section.title}</h3>
                          <p className="text-xs text-slate-500">{section.lessons?.length || 0} lessons</p>
                        </div>
                        {expandedSections[section._id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                      {expandedSections[section._id] && section.lessons && (
                        <div className="border-t border-slate-100 dark:border-slate-800">
                          {section.lessons.map((lesson) => {
                            const isCompleted = enrollment?.completedLessons?.includes(lesson._id);
                            const canAccess = enrollment || lesson.isPreview;
                            return (
                              <div
                                key={lesson._id}
                                className="flex items-center gap-3 border-b border-slate-50 px-4 py-2.5 last:border-0 dark:border-slate-800/50"
                              >
                                {canAccess ? (
                                  isCompleted ? (
                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                                  ) : (
                                    <PlayCircle className="h-4 w-4 shrink-0 text-slate-400" />
                                  )
                                ) : (
                                  <Lock className="h-4 w-4 shrink-0 text-slate-400" />
                                )}
                                <span className={`text-sm ${canAccess ? "text-slate-700 dark:text-slate-300" : "text-slate-400"}`}>
                                  {lesson.title}
                                </span>
                                {lesson.isPreview && (
                                  <span className="badge bg-brand-50 text-brand-600 text-[10px] dark:bg-brand-950/30 dark:text-brand-400">
                                    Preview
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews */}
            <div>
              <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-slate-100">Reviews</h2>
              {reviews.length === 0 ? (
                <p className="text-sm text-slate-500">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => {
                    const student = typeof review.student === "object" ? review.student : null;
                    return (
                      <div key={review._id} className="card p-4">
                        <div className="flex items-center gap-3">
                          {student?.avatar?.url ? (
                            <img src={student.avatar.url} alt={student.name} className="h-8 w-8 rounded-full" />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-600 dark:bg-brand-900/40 dark:text-brand-400">
                              {student?.name?.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{student?.name}</p>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className={`h-3 w-3 ${s <= review.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                              ))}
                            </div>
                          </div>
                        </div>
                        {review.comment && <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{review.comment}</p>}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add review form */}
              {enrollment && (
                <form onSubmit={handleReview} className="card mt-4 p-4">
                  <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-3">Leave a Review</h3>
                  <div className="mb-3 flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setReviewRating(s)}
                      >
                        <Star className={`h-6 w-6 ${s <= reviewRating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience..."
                    className="input-field mb-3"
                    rows={3}
                  />
                  <button type="submit" className="btn-primary">Submit Review</button>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar - enrollment card */}
          <div className="lg:col-span-1">
            <div className="card sticky top-8 overflow-hidden">
              {course.thumbnail?.url && (
                <div className="h-32 bg-slate-100 dark:bg-slate-800">
                  <img src={course.thumbnail.url} alt={course.title} className="h-full w-full object-cover" />
                </div>
              )}
              <div className="p-5">
                <div className="mb-4 text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {course.isFree ? "Free" : `$${course.price}`}
                </div>

                {enrollment ? (
                  <>
                    <div className="mb-4">
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-slate-500">Your Progress</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{enrollment.progress}%</span>
                      </div>
                      <ProgressBar value={enrollment.progress} color={enrollment.progress === 100 ? "green" : "brand"} />
                    </div>
                    <Link href={`/student/my-courses/${course._id}`} className="btn-primary w-full">
                      {enrollment.isCompleted ? "Review Course" : "Continue Learning"}
                    </Link>
                  </>
                ) : (
                  <button
                    onClick={() => (user ? setShowEnrollConfirm(true) : router.push("/login"))}
                    className="btn-primary w-full"
                  >
                    {user ? "Enroll Now" : "Sign in to Enroll"}
                  </button>
                )}

                <div className="mt-5 space-y-3 border-t border-slate-100 pt-5 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <BookOpen size={16} /> {totalLessons} lessons
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Users size={16} /> {course.numStudents} enrolled
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Star size={16} /> {course.rating || "No rating yet"}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Clock size={16} /> {course.level}
                  </div>
                </div>

                {/* AI assistant shortcut */}
                {enrollment && (
                  <Link href="/student/ai-assistant" className="btn-secondary mt-4 w-full">
                    <Bot size={16} /> Ask AI about this course
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showEnrollConfirm}
        title="Enroll in this course?"
        message={`You're about to enroll in "${course.title}". You'll get access to all lessons and resources.`}
        confirmText="Yes, enroll me"
        onConfirm={handleEnroll}
        onCancel={() => setShowEnrollConfirm(false)}
        loading={enrolling}
      />
    </div>
  );
}
