"use client";

import { useEffect, useState } from "react";
import { Search, Loader2, CheckCircle2, XCircle, BookOpen, User as UserIcon, Star, Trash2 } from "lucide-react";
import { adminApi, getErrorMessage } from "@/services/api";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import type { Course } from "@/types";
import toast from "react-hot-toast";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [actionTarget, setActionTarget] = useState<{ course: Course; action: "approve" | "reject" | "delete" } | null>(null);
  const [actioning, setActioning] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    fetchCourses();
  }, [statusFilter]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      const res = await adminApi.getCourses(params);
      setCourses(res.data.data || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!actionTarget) return;
    setActioning(true);
    try {
      const { course, action } = actionTarget;
      if (action === "approve") await adminApi.approveCourse(course._id);
      else if (action === "reject") await adminApi.rejectCourse(course._id, rejectReason);
      else if (action === "delete") await adminApi.deleteCourse(course._id);
      toast.success(`Course ${action}d`);
      setActionTarget(null);
      setRejectReason("");
      fetchCourses();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActioning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Course Management</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Review, approve, and manage all platform courses.</p>
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field max-w-xs">
          <option value="">All Courses</option>
          <option value="pending">Pending Approval</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-brand-500" />
        </div>
      ) : courses.length === 0 ? (
        <EmptyState icon={BookOpen} title="No courses found" description="No courses match the current filter." />
      ) : (
        <div className="space-y-3">
          {courses.map((course) => {
            const instructor = typeof course.instructor === "object" ? course.instructor : null;
            return (
              <div key={course._id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                    {course.thumbnail?.url ? (
                      <img src={course.thumbnail.url} alt={course.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <BookOpen className="h-5 w-5 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">{course.title}</h3>
                    <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <UserIcon size={12} /> {instructor?.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star size={12} /> {course.rating || "—"}
                      </span>
                      <span>{course.numStudents} students</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {course.approvalStatus === "pending" && (
                    <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">Pending</span>
                  )}
                  {course.approvalStatus === "approved" && (
                    <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">Approved</span>
                  )}
                  {course.approvalStatus === "rejected" && (
                    <span className="badge bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400">Rejected</span>
                  )}

                  <div className="flex gap-1">
                    {course.approvalStatus === "pending" && (
                      <>
                        <button
                          onClick={() => setActionTarget({ course, action: "approve" })}
                          className="flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400"
                        >
                          <CheckCircle2 size={14} /> Approve
                        </button>
                        <button
                          onClick={() => setActionTarget({ course, action: "reject" })}
                          className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400"
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setActionTarget({ course, action: "delete" })}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!actionTarget}
        title={
          actionTarget?.action === "approve" ? "Approve course?" :
          actionTarget?.action === "reject" ? "Reject course?" :
          "Delete course?"
        }
        message={
          actionTarget?.action === "approve"
            ? `"${actionTarget?.course.title}" will be approved and published immediately.`
            : actionTarget?.action === "reject"
            ? `"${actionTarget?.course.title}" will be rejected. The instructor will be notified.`
            : `This will permanently delete "${actionTarget?.course?.title}" and all its content.`
        }
        danger={actionTarget?.action === "delete" || actionTarget?.action === "reject"}
        confirmText={actionTarget?.action === "approve" ? "Approve" : actionTarget?.action === "reject" ? "Reject" : "Delete"}
        loading={actioning}
        onConfirm={handleAction}
        onCancel={() => { setActionTarget(null); setRejectReason(""); }}
      />

      {/* Reject reason input */}
      {actionTarget?.action === "reject" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="fixed inset-0 bg-black/50" onClick={() => setActionTarget(null)} />
          <div className="relative z-10 w-full max-w-md animate-scale-in rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <h3 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Rejection Reason</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Provide feedback for the instructor..."
              rows={3}
              className="input-field resize-y mb-3"
            />
            <div className="flex gap-2">
              <button onClick={handleAction} disabled={actioning} className="btn-danger">
                {actioning ? "Processing..." : "Confirm Rejection"}
              </button>
              <button onClick={() => setActionTarget(null)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
