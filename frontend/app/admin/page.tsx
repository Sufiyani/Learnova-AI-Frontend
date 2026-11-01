"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  BookOpen,
  GraduationCap,
  TrendingUp,
  Star,
  FolderPlus,
  Clock,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { adminApi, getErrorMessage } from "@/services/api";
import { DashboardSkeleton } from "@/components/ui/Skeleton";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await adminApi.getStats();
      setData(res.data.data);
    } catch (err) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <DashboardSkeleton />;

  const stats = data?.stats || {};
  const recentActivity = data?.recentActivity || [];

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "bg-brand-50 text-brand-600 dark:bg-brand-950/40", link: "/admin/users" },
    { label: "Students", value: stats.totalStudents, icon: GraduationCap, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40" },
    { label: "Instructors", value: stats.totalInstructors, icon: Users, color: "bg-purple-50 text-purple-600 dark:bg-purple-950/40" },
    { label: "Total Courses", value: stats.totalCourses, icon: BookOpen, color: "bg-amber-50 text-amber-600 dark:bg-amber-950/40", link: "/admin/courses" },
    { label: "Enrollments", value: stats.totalEnrollments, icon: TrendingUp, color: "bg-teal-50 text-teal-600 dark:bg-teal-950/40" },
    { label: "Published", value: stats.publishedCourses, icon: Star, color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40" },
    { label: "Pending Review", value: stats.pendingCourses, icon: Clock, color: "bg-orange-50 text-orange-600 dark:bg-orange-950/40" },
    { label: "Blocked Users", value: stats.blockedUsers, icon: ShieldCheck, color: "bg-red-50 text-red-600 dark:bg-red-950/40" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Platform overview and management.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.label} className={`card p-4 ${stat.link ? "transition-all hover:shadow-md" : ""}`}>
            {stat.link ? (
              <Link href={stat.link}>
                <StatCardContent stat={stat} />
              </Link>
            ) : (
              <StatCardContent stat={stat} />
            )}
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="card p-5">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
          <Clock size={18} className="text-brand-500" /> Recent Platform Activity
        </h2>
        {recentActivity.length === 0 ? (
          <p className="text-sm text-slate-400">No recent activity.</p>
        ) : (
          <div className="space-y-3">
            {recentActivity.slice(0, 10).map((activity: any) => (
              <div key={activity._id} className="flex items-center gap-3 text-sm">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                  {activity.user ? (
                    <span className="text-xs font-semibold text-slate-500">{activity.user.name?.charAt(0).toUpperCase()}</span>
                  ) : (
                    <Users size={14} className="text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-slate-700 dark:text-slate-300">
                    {activity.user?.name || "Someone"} — {activity.description}
                  </p>
                  <p className="text-xs text-slate-400">{new Date(activity.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/users" className="card group flex items-center gap-3 p-4 transition-all hover:shadow-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950/40">
            <Users className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-100">Manage Users</p>
            <p className="text-xs text-slate-500">View, block, and manage all users</p>
          </div>
        </Link>
        <Link href="/admin/courses" className="card group flex items-center gap-3 p-4 transition-all hover:shadow-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/40">
            <BookOpen className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-100">Manage Courses</p>
            <p className="text-xs text-slate-500">Approve or reject course submissions</p>
          </div>
        </Link>
        <Link href="/admin/categories" className="card group flex items-center gap-3 p-4 transition-all hover:shadow-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950/40">
            <FolderPlus className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-100">Categories</p>
            <p className="text-xs text-slate-500">Manage course categories</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

function StatCardContent({ stat }: { stat: any }) {
  return (
    <div>
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
        <stat.icon size={20} />
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</p>
      <p className="text-xs text-slate-500">{stat.label}</p>
    </div>
  );
}
