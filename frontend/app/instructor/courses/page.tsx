"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Users, Star, FolderPlus, Eye, CheckCircle2 } from "lucide-react";
import { courseApi, getErrorMessage } from "@/services/api";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import ProgressBar from "@/components/ui/ProgressBar";
import type { Course } from "@/types";
import toast from "react-hot-toast";

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await courseApi.getInstructorCourses();
      setCourses(res.data.data.courses || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">My Courses</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{courses.length} course{courses.length !== 1 && "s"}</p>
        </div>
        <Link href="/instructor/courses/create" className="btn-primary">
          <FolderPlus size={16} /> Create Course
        </Link>
      </div>

      {courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="Create your first course to start teaching."
          action={<Link href="/instructor/courses/create" className="btn-primary">Create Course</Link>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div key={course._id} className="card overflow-hidden">
              <Link href={`/instructor/courses/${course._id}`}>
                <div className="h-36 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  {course.thumbnail?.url ? (
                    <img src={course.thumbnail.url} alt={course.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookOpen className="h-8 w-8 text-slate-300" />
                    </div>
                  )}
                </div>
              </Link>
              <div className="p-4">
                <Link href={`/instructor/courses/${course._id}`}>
                  <h3 className="line-clamp-1 font-semibold text-slate-900 hover:text-brand-600 dark:text-slate-100">{course.title}</h3>
                </Link>
                <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Users size={12} /> {course.numStudents}</span>
                  <span className="flex items-center gap-1"><Star size={12} /> {course.rating || "—"}</span>
                </div>
                <div className="mt-3">
                  {course.isPublished ? (
                    <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">Published</span>
                  ) : course.approvalStatus === "pending" ? (
                    <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">Awaiting Approval</span>
                  ) : course.approvalStatus === "rejected" ? (
                    <span className="badge bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400">Rejected</span>
                  ) : (
                    <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">Draft</span>
                  )}
                </div>
                <Link href={`/instructor/courses/${course._id}`} className="btn-secondary mt-3 w-full text-sm">
                  <Eye size={14} /> Manage Course
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
