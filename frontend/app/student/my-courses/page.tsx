"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GraduationCap, BookOpen, ArrowRight } from "lucide-react";
import { enrollmentApi, getErrorMessage } from "@/services/api";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import ProgressBar from "@/components/ui/ProgressBar";
import type { Enrollment } from "@/types";
import toast from "react-hot-toast";

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "in-progress" | "completed">("all");

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const res = await enrollmentApi.getMyEnrollments();
      setEnrollments(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const filtered = enrollments.filter((e) => {
    if (filter === "in-progress") return !e.isCompleted;
    if (filter === "completed") return e.isCompleted;
    return true;
  });

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">My Courses</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {enrollments.length} course{enrollments.length !== 1 && "s"} enrolled
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { key: "all", label: "All" },
          { key: "in-progress", label: "In Progress" },
          { key: "completed", label: "Completed" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              filter === tab.key
                ? "border-brand-500 text-brand-600"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No courses yet"
          description="Browse our catalog and enroll in your first course."
          action={<Link href="/courses" className="btn-primary">Browse Courses</Link>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((enrollment) => (
            <div key={enrollment._id} className="card overflow-hidden">
              <Link href={`/student/my-courses/${enrollment.course._id}`}>
                <div className="h-36 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  {enrollment.course.thumbnail?.url ? (
                    <img src={enrollment.course.thumbnail.url} alt={enrollment.course.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookOpen className="h-8 w-8 text-slate-300" />
                    </div>
                  )}
                </div>
              </Link>
              <div className="p-4">
                <Link href={`/student/my-courses/${enrollment.course._id}`}>
                  <h3 className="line-clamp-2 font-semibold text-slate-900 hover:text-brand-600 dark:text-slate-100">{enrollment.course.title}</h3>
                </Link>
                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-slate-500">{enrollment.isCompleted ? "Completed" : "Progress"}</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{enrollment.progress}%</span>
                  </div>
                  <ProgressBar value={enrollment.progress} color={enrollment.isCompleted ? "green" : "brand"} />
                </div>
                <Link
                  href={`/student/my-courses/${enrollment.course._id}`}
                  className="mt-3 flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  {enrollment.isCompleted ? "Review Course" : "Continue"} <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
