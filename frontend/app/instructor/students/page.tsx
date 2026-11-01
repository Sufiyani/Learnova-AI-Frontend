"use client";

import { useEffect, useState } from "react";
import { Users, Loader2, BookOpen, TrendingUp } from "lucide-react";
import { courseApi, enrollmentApi, getErrorMessage } from "@/services/api";
import EmptyState from "@/components/ui/EmptyState";
import ProgressBar from "@/components/ui/ProgressBar";
import type { Course } from "@/types";
import toast from "react-hot-toast";

export default function InstructorStudentsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) fetchEnrollments();
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const res = await courseApi.getInstructorCourses();
      setCourses(res.data.data.courses || []);
      if (res.data.data.courses?.length > 0) {
        setSelectedCourse(res.data.data.courses[0]._id);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    setLoadingEnrollments(true);
    try {
      const res = await enrollmentApi.getCourseEnrollments(selectedCourse);
      setEnrollments(res.data.data.enrollments || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoadingEnrollments(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-brand-500" />
      </div>
    );
  }

  const totalStudents = new Set(enrollments.map((e) => typeof e.student === "object" ? e.student?._id : e.student)).size;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Students</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Track student progress across your courses.</p>
      </div>

      {courses.length === 0 ? (
        <EmptyState icon={Users} title="No courses yet" description="Create a course to start enrolling students." />
      ) : (
        <>
          {/* Course selector */}
          <div className="flex items-end gap-4">
            <div className="flex-1 max-w-xs">
              <label className="label-field">Select Course</label>
              <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="input-field">
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div className="card px-4 py-3">
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{enrollments.length}</p>
              <p className="text-xs text-slate-500">Enrolled students</p>
            </div>
          </div>

          {/* Students list */}
          {loadingEnrollments ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-brand-500" />
            </div>
          ) : enrollments.length === 0 ? (
            <EmptyState icon={Users} title="No students enrolled" description="Students will appear here when they enroll in this course." />
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
                      <th className="px-4 py-3 font-medium">Student</th>
                      <th className="px-4 py-3 font-medium">Progress</th>
                      <th className="px-4 py-3 font-medium">Lessons Completed</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Enrolled</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.map((enr) => {
                      const student = typeof enr.student === "object" ? enr.student : null;
                      return (
                        <tr key={enr._id} className="border-b border-slate-50 last:border-0 dark:border-slate-800/50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-600 dark:bg-brand-900/40 dark:text-brand-400">
                                {student?.name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-slate-900 dark:text-slate-100">{student?.name}</p>
                                <p className="text-xs text-slate-400">{student?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="w-24">
                              <ProgressBar value={enr.progress} color={enr.isCompleted ? "green" : "brand"} />
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{enr.completedLessons?.length || 0}</td>
                          <td className="px-4 py-3">
                            {enr.isCompleted ? (
                              <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">Completed</span>
                            ) : (
                              <span className="badge bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">In Progress</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-500">{new Date(enr.createdAt).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
