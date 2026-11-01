"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  PlayCircle,
  Lock,
  ChevronLeft,
  Download,
  FileText,
  Bot,
  ChevronDown,
} from "lucide-react";
import { courseApi, enrollmentApi, lessonApi, getErrorMessage } from "@/services/api";
import { FullPageSpinner } from "@/components/ui/Spinner";
import ProgressBar from "@/components/ui/ProgressBar";
import type { Course, Section, Lesson, Enrollment } from "@/types";
import toast from "react-hot-toast";
import Link from "next/link";

export default function LearnCoursePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [curriculum, setCurriculum] = useState<Section[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const res = await courseApi.getById(id as string);
      setCourse(res.data.data.course);
      setCurriculum(res.data.data.curriculum || []);
      setEnrollment(res.data.data.enrollment);

      // Expand all sections
      const expanded: Record<string, boolean> = {};
      (res.data.data.curriculum || []).forEach((s: Section) => (expanded[s._id] = true));
      setExpandedSections(expanded);

      // Find the last lesson to resume
      const lastLessonId = res.data.data.enrollment?.lastLesson;
      const firstLesson = res.data.data.curriculum?.[0]?.lessons?.[0];
      const lessonToLoad = lastLessonId || firstLesson?._id;
      if (lessonToLoad) {
        await loadLesson(lessonToLoad);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const loadLesson = async (lessonId: string) => {
    try {
      const res = await lessonApi.getLesson(lessonId);
      setActiveLesson(res.data.data.lesson);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleMarkComplete = async () => {
    if (!activeLesson || !enrollment) return;
    try {
      await enrollmentApi.markLessonComplete(id as string, activeLesson._id);
      toast.success("Lesson completed!");
      fetchCourse();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const isCompleted = (lessonId: string) => enrollment?.completedLessons?.includes(lessonId);

  if (loading) return <FullPageSpinner />;
  if (!course) return <div className="p-8 text-center text-slate-500">Course not found.</div>;
  if (!enrollment) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <Lock className="h-12 w-12 text-slate-300" />
        <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-slate-100">Enrollment Required</h2>
        <p className="mt-1 text-sm text-slate-500">You need to enroll in this course to access the content.</p>
        <Link href={`/courses/${id}`} className="btn-primary mt-4">View Course</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            <ChevronLeft size={16} /> Back
          </button>
          <h1 className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">{course.title}</h1>
        </div>
        <div className="w-32">
          <div className="mb-1 text-right text-xs text-slate-500">{enrollment.progress}%</div>
          <ProgressBar value={enrollment.progress} color={enrollment.progress === 100 ? "green" : "brand"} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Lesson content */}
        <div className="lg:col-span-2 space-y-4">
          {activeLesson?.video?.url && (
            <div className="overflow-hidden rounded-xl bg-black">
              <video
                src={activeLesson.video.url}
                controls
                className="w-full"
                onPlay={() => enrollmentApi.markLessonComplete(id as string, activeLesson._id).catch(() => {})}
              />
            </div>
          )}

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{activeLesson?.title}</h2>
            {activeLesson?.description && <p className="mt-1 text-sm text-slate-500">{activeLesson.description}</p>}

            {activeLesson?.content && (
              <div className="prose-content mt-4 text-sm text-slate-700 dark:text-slate-300" dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
            )}

            {/* Resources */}
            {activeLesson?.resources && activeLesson.resources.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Resources</h3>
                <div className="space-y-2">
                  {activeLesson.resources.map((resource, idx) => (
                    <a
                      key={idx}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      {resource.type === "pdf" ? <FileText size={16} className="text-red-500" /> : <Download size={16} />}
                      {resource.name}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Mark complete */}
            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
              {activeLesson && (
                <span className={`text-sm font-medium ${isCompleted(activeLesson._id) ? "text-emerald-600" : "text-slate-500"}`}>
                  {isCompleted(activeLesson._id) ? "✓ Completed" : "Not completed yet"}
                </span>
              )}
              <button
                onClick={handleMarkComplete}
                disabled={activeLesson ? isCompleted(activeLesson._id) : true}
                className="btn-primary"
              >
                <CheckCircle2 size={16} /> Mark as Complete
              </button>
            </div>
          </div>

          {/* AI Assistant shortcut */}
          <Link href="/student/ai-assistant" className="card flex items-center gap-3 p-4 hover:shadow-md transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950/40">
              <Bot className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Ask AI about this lesson</p>
              <p className="text-xs text-slate-500">Get explanations, examples, and practice questions</p>
            </div>
          </Link>
        </div>

        {/* Sidebar - curriculum */}
        <div className="lg:col-span-1">
          <div className="card max-h-[calc(100vh-8rem)] overflow-y-auto sticky top-4">
            <div className="border-b border-slate-100 p-4 dark:border-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Course Content</h3>
              <p className="text-xs text-slate-500">{enrollment.completedLessons?.length || 0} of {curriculum.reduce((sum, s) => sum + (s.lessons?.length || 0), 0)} lessons complete</p>
            </div>
            <div>
              {curriculum.map((section) => (
                <div key={section._id} className="border-b border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => toggleSection(section._id)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                  >
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{section.title}</span>
                    <ChevronDown size={16} className={`transition-transform ${expandedSections[section._id] ? "rotate-180" : ""}`} />
                  </button>
                  {expandedSections[section._id] && section.lessons && (
                    <div className="pb-2">
                      {section.lessons.map((lesson) => (
                        <button
                          key={lesson._id}
                          onClick={() => loadLesson(lesson._id)}
                          className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors ${
                            activeLesson?._id === lesson._id
                              ? "bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-400"
                              : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50"
                          }`}
                        >
                          {isCompleted(lesson._id) ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                          ) : (
                            <PlayCircle className="h-4 w-4 shrink-0 text-slate-400" />
                          )}
                          <span className="line-clamp-1">{lesson.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
