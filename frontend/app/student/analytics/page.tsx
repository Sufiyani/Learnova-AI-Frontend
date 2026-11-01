"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Area,
  AreaChart,
  Legend,
} from "recharts";
import {
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Flame,
  Clock,
  Brain,
  ClipboardCheck,
  Trophy,
  Loader2,
} from "lucide-react";
import { analyticsApi, getErrorMessage } from "@/services/api";
import ProgressBar from "@/components/ui/ProgressBar";
import toast from "react-hot-toast";

export default function StudentAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await analyticsApi.getStudent();
      setAnalytics(res.data.data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-brand-500" />
      </div>
    );
  }

  const stats = analytics?.stats || {};
  const weeklyActivity = analytics?.weeklyActivity || [];
  const enrollments = analytics?.enrollments || [];

  // Map day numbers to day names (MongoDB $dayOfWeek: 1=Sunday)
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyData = dayNames.map((day, i) => {
    const dayData = weeklyActivity.find((a: any) => a._id - 1 === i);
    return { day, activities: dayData?.count || 0 };
  });

  const statCards = [
    { label: "Enrolled Courses", value: stats.totalEnrolled, icon: BookOpen, color: "bg-brand-50 text-brand-600 dark:bg-brand-950/40" },
    { label: "Completed", value: stats.completedCourses, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40" },
    { label: "Avg Progress", value: `${stats.avgProgress}%`, icon: TrendingUp, color: "bg-amber-50 text-amber-600 dark:bg-amber-950/40" },
    { label: "Study Streak", value: `${stats.studyStreak} days`, icon: Flame, color: "bg-orange-50 text-orange-600 dark:bg-orange-950/40" },
    { label: "Quizzes Taken", value: stats.totalQuizAttempts, icon: Brain, color: "bg-purple-50 text-purple-600 dark:bg-purple-950/40" },
    { label: "Avg Quiz Score", value: `${stats.avgQuizScore}%`, icon: Trophy, color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40" },
    { label: "Assignments Graded", value: stats.totalGradedSubmissions, icon: ClipboardCheck, color: "bg-teal-50 text-teal-600 dark:bg-teal-950/40" },
    { label: "Avg Assignment Score", value: stats.avgAssignmentScore, icon: CheckCircle2, color: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Learning Analytics</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Track your learning progress and performance over time.
        </p>
      </div>

      {/* Stat cards */}
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

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly activity */}
        <div className="card p-5">
          <h3 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">Weekly Activity</h3>
          {weeklyData.every((d) => d.activities === 0) ? (
            <p className="py-8 text-center text-sm text-slate-400">No activity this week yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorActivities" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "none",
                    borderRadius: "8px",
                    color: "#f1f5f9",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="activities"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#colorActivities)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Course progress */}
        <div className="card p-5">
          <h3 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">Course Progress</h3>
          {enrollments.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">No courses enrolled</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {enrollments.map((enr: any, i: number) => (
                <div key={i}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="truncate text-slate-700 dark:text-slate-300">{enr.course?.title}</span>
                    <span className="font-medium text-slate-500 ml-2 shrink-0">{enr.progress}%</span>
                  </div>
                  <ProgressBar value={enr.progress} color={enr.isCompleted ? "green" : "brand"} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activity breakdown */}
      {analytics?.activityByType && analytics.activityByType.length > 0 && (
        <div className="card p-5">
          <h3 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">Activity Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.activityByType.map((a: any) => ({
              type: a._id.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
              count: a.count,
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
              <XAxis dataKey="type" stroke="#94a3b8" fontSize={11} angle={-15} textAnchor="end" height={60} />
              <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "none",
                  borderRadius: "8px",
                  color: "#f1f5f9",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
