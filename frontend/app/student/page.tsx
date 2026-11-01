"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  Flame,
  TrendingUp,
  Bot,
  ArrowRight,
  Clock,
  CheckCircle2,
  ClipboardList,
  Award,
} from "lucide-react";
import { enrollmentApi, analyticsApi, notificationApi, getErrorMessage } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import CourseCard from "@/components/CourseCard";
import ProgressBar from "@/components/ui/ProgressBar";
import EmptyState from "@/components/ui/EmptyState";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import type { Enrollment, Course } from "@/types";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchEnrollments(), fetchAnalytics()])
      .finally(() => setLoading(false));
  }, []);

  const fetchEnrollments = async () => {
    try {
      const res = await enrollmentApi.getMyEnrollments();
      const enrollmentList = res.data.data;
      setEnrollments(Array.isArray(enrollmentList) ? enrollmentList : []);
    } catch (err) {
      // will show empty state
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await analyticsApi.getStudent();
      setAnalytics(res.data.data.stats);
      setRecentActivity(res.data.data.recentActivity || []);
    } catch (err) {
      // silent
    }
  };

  const inProgressCourses = enrollments.filter((e) => !e.isCompleted);
  const completedCourses = enrollments.filter((e) => e.isCompleted);
  const recommended = []; // Could fetch from API

  const stats = [
    { label: "Enrolled Courses", value: enrollments.length, icon: BookOpen, color: "bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400" },
    { label: "In Progress", value: inProgressCourses.length, icon: TrendingUp, color: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400" },
    { label: "Completed", value: completedCourses.length, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" },
    { label: "Study Streak", value: `${analytics?.studyStreak || 0} days`, icon: Flame, color: "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400" },
  ];

  if (loading) return <DashboardSkeleton />;

  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Welcome back, {firstName} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Ready to continue learning? Pick up where you left off.
          </p>
        </div>
        <Link href="/student/ai-assistant" className="btn-primary">
          <Bot size={16} /> Ask AI Assistant
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-4">
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Continue learning */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Continue Learning</h2>
          <Link href="/student/my-courses" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            View all →
          </Link>
        </div>

        {inProgressCourses.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="No courses in progress"
            description="Browse our course catalog and start learning today."
            action={<Link href="/courses" className="btn-primary">Browse Courses</Link>}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {inProgressCourses.slice(0, 3).map((enrollment) => (
              <div key={enrollment._id} className="card p-4">
                <Link href={`/student/my-courses/${enrollment.course._id}`} className="group">
                  <div className="mb-3 h-28 w-full overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                    {enrollment.course.thumbnail?.url ? (
                      <img src={enrollment.course.thumbnail.url} alt={enrollment.course.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <BookOpen className="h-8 w-8 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <h3 className="line-clamp-1 font-semibold text-slate-900 group-hover:text-brand-600 dark:text-slate-100">{enrollment.course.title}</h3>
                </Link>
                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                    <span>Progress</span>
                    <span>{enrollment.progress}%</span>
                  </div>
                  <ProgressBar value={enrollment.progress} color={enrollment.progress === 100 ? "green" : "brand"} />
                </div>
                <Link
                  href={`/student/my-courses/${enrollment.course._id}`}
                  className="mt-3 flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  Continue <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Two column section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Completed courses */}
        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-emerald-500" />
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Completed Courses</h2>
          </div>
          {completedCourses.length === 0 ? (
            <p className="text-sm text-slate-400">No completed courses yet.</p>
          ) : (
            <div className="space-y-3">
              {completedCourses.slice(0, 5).map((e) => (
                <Link key={e._id} href={`/student/my-courses/${e.course._id}`} className="block text-sm font-medium text-slate-700 hover:text-brand-600 dark:text-slate-300">
                  <span className="line-clamp-1">{e.course.title}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-brand-500" />
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Recent Activity</h2>
          </div>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-slate-400">No recent activity.</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.slice(0, 6).map((activity) => (
                <div key={activity._id} className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                    {activity.type.includes("quiz") ? (
                      <Bot className="h-4 w-4 text-brand-500" />
                    ) : activity.type.includes("assignment") ? (
                      <ClipboardList className="h-4 w-4 text-amber-500" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-700 dark:text-slate-300 truncate">{activity.description}</p>
                    <p className="text-xs text-slate-400">{new Date(activity.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recommended courses */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recommended for You</h2>
          <Link href="/courses" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            Browse all →
          </Link>
        </div>
        <p className="text-sm text-slate-400">Browse our course catalog to find new courses to learn.</p>
        <div className="mt-3">
          <Link href="/courses" className="btn-secondary">
            <BookOpen size={16} /> Explore Courses
          </Link>
        </div>
      </div>
    </div>
  );
}
