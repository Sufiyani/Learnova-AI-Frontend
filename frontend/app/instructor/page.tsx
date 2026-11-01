"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Users,
  Star,
  ClipboardList,
  Loader2,
  TrendingUp,
  FolderPlus,
  Clock,
} from "lucide-react";
import { analyticsApi, getErrorMessage } from "@/services/api";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";

export default function InstructorDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await analyticsApi.getInstructor();
      setAnalytics(res.data.data);
    } catch (err) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <DashboardSkeleton />;

  const stats = analytics?.stats || {};
  const courseStats = analytics?.courseStats || [];
  const recentEnrollments = analytics?.recentEnrollments || [];

  const statCards = [
    { label: "Total Courses", value: stats.totalCourses, icon: BookOpen, color: "bg-brand-50 text-brand-600 dark:bg-brand-950/40" },
    { label: "Total Students", value: stats.totalStudents, icon: Users, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40" },
    { label: "Avg Rating", value: stats.avgRating || 0, icon: Star, color: "bg-amber-50 text-amber-600 dark:bg-amber-950/40" },
    { label: "Pending Reviews", value: stats.pendingSubmissions, icon: ClipboardList, color: "bg-orange-50 text-orange-600 dark:bg-orange-950/40" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Instructor Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your courses and track student engagement.</p>
        </div>
        <Link href="/instructor/courses/create" className="btn-primary">
          <FolderPlus size={16} /> Create Course
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="card p-4">
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</p>
            <p className="text-xs text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Course performance */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Course Performance</h2>
          <Link href="/instructor/courses" className="text-sm font-medium text-brand-600 hover:text-brand-700">View all →</Link>
        </div>

        {courseStats.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No courses yet"
            description="Create your first course to get started."
            action={<Link href="/instructor/courses/create" className="btn-primary">Create Course</Link>}
          />
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
                    <th className="px-4 py-3 font-medium">Course</th>
                    <th className="px-4 py-3 font-medium">Students</th>
                    <th className="px-4 py-3 font-medium">Rating</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courseStats.map((course: any) => (
                    <tr key={course._id} className="border-b border-slate-50 last:border-0 dark:border-slate-800/50">
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-900 dark:text-slate-100">{course.title}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{course.numStudents}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {course.rating > 0 ? `⭐ ${course.rating}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {course.isPublished ? (
                          <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">Published</span>
                        ) : course.approvalStatus === "pending" ? (
                          <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">Pending</span>
                        ) : (
                          <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">Draft</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/instructor/courses/${course._id}`} className="text-brand-600 hover:text-brand-700">
                          Manage →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Recent enrollments */}
      <div className="card p-5">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
          <TrendingUp size={18} className="text-brand-500" /> Recent Enrollments
        </h2>
        {recentEnrollments.length === 0 ? (
          <p className="text-sm text-slate-400">No recent enrollments.</p>
        ) : (
          <div className="space-y-3">
            {recentEnrollments.map((enr: any) => (
              <div key={enr._id} className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-600 dark:bg-brand-900/40 dark:text-brand-400">
                  {enr.student?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{enr.student?.name}</p>
                  <p className="truncate text-xs text-slate-500">enrolled in {enr.course?.title}</p>
                </div>
                <span className="text-xs text-slate-400">
                  <Clock size={12} className="inline mr-1" />
                  {new Date(enr.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
