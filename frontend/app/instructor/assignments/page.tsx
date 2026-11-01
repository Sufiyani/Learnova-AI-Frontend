"use client";

import { useEffect, useState } from "react";
import {
  ClipboardList,
  Plus,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Loader2,
  Save,
  X,
  FileText,
  Award,
} from "lucide-react";
import { courseApi, assignmentApi, submissionApi, getErrorMessage } from "@/services/api";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import type { Course, Assignment, AssignmentSubmission } from "@/types";
import toast from "react-hot-toast";

export default function InstructorAssignmentsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [viewSubmissions, setViewSubmissions] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [gradeForm, setGradeForm] = useState({ marks: 0, feedback: "" });

  // Create form
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    instructions: "",
    deadline: "",
    maxMarks: 100,
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) fetchAssignments();
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const res = await courseApi.getInstructorCourses();
      const courseList = res.data.data.courses || [];
      setCourses(courseList);
      if (courseList.length > 0) setSelectedCourse(courseList[0]._id);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const res = await assignmentApi.getByCourse(selectedCourse);
      setAssignments(res.data.data.assignments || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await assignmentApi.create(selectedCourse, createForm);
      toast.success("Assignment created");
      setShowCreateForm(false);
      setCreateForm({ title: "", description: "", instructions: "", deadline: "", maxMarks: 100 });
      fetchAssignments();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleViewSubmissions = async (assignment: Assignment) => {
    setViewSubmissions(assignment);
    setLoadingSubmissions(true);
    try {
      const res = await submissionApi.getAssignmentSubmissions(assignment._id);
      setSubmissions(res.data.data.submissions || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleGrade = async (submissionId: string) => {
    try {
      await submissionApi.grade(submissionId, gradeForm);
      toast.success("Submission graded");
      setGradingId(null);
      setGradeForm({ marks: 0, feedback: "" });
      if (viewSubmissions) handleViewSubmissions(viewSubmissions);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await assignmentApi.delete(deleteTarget);
      toast.success("Assignment deleted");
      setDeleteTarget(null);
      fetchAssignments();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Assignments</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create and grade assignments for your courses.</p>
        </div>
        {selectedCourse && (
          <button onClick={() => setShowCreateForm(!showCreateForm)} className="btn-primary">
            <Plus size={16} /> {showCreateForm ? "Cancel" : "Create Assignment"}
          </button>
        )}
      </div>

      {/* Course selector */}
      <div>
        <label className="label-field">Select Course</label>
        <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="input-field max-w-xs">
          {courses.map((c) => (
            <option key={c._id} value={c._id}>{c.title}</option>
          ))}
        </select>
      </div>

      {/* Create form */}
      {showCreateForm && (
        <form onSubmit={handleCreate} className="card space-y-4 p-5">
          <div>
            <label className="label-field">Assignment Title *</label>
            <input
              type="text"
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="label-field">Description *</label>
            <textarea
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              rows={3}
              className="input-field resize-y"
              required
            />
          </div>
          <div>
            <label className="label-field">Instructions</label>
            <textarea
              value={createForm.instructions}
              onChange={(e) => setCreateForm({ ...createForm, instructions: e.target.value })}
              rows={2}
              placeholder="Additional instructions for students..."
              className="input-field resize-y"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-field">Deadline *</label>
              <input
                type="datetime-local"
                value={createForm.deadline}
                onChange={(e) => setCreateForm({ ...createForm, deadline: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label-field">Max Marks</label>
              <input
                type="number"
                value={createForm.maxMarks}
                onChange={(e) => setCreateForm({ ...createForm, maxMarks: parseInt(e.target.value) || 100 })}
                min={1}
                className="input-field"
              />
            </div>
          </div>
          <button type="submit" className="btn-primary">
            <Save size={16} /> Create Assignment
          </button>
        </form>
      )}

      {/* Assignments list */}
      {!showCreateForm && (
        <>
          {assignments.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No assignments yet"
              description="Create your first assignment for this course."
              action={<button onClick={() => setShowCreateForm(true)} className="btn-primary">Create Assignment</button>}
            />
          ) : (
            <div className="space-y-3">
              {assignments.map((assignment) => (
                <div key={assignment._id} className="card p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">{assignment.title}</h3>
                      <p className="mt-1 text-sm text-slate-500 line-clamp-2">{assignment.description}</p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> Due {new Date(assignment.deadline).toLocaleDateString()}
                        </span>
                        <span>Max: {assignment.maxMarks} marks</span>
                        <span>{assignment.numSubmissions || 0} submissions</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleViewSubmissions(assignment)} className="btn-secondary text-sm">
                        <Eye size={14} /> View Submissions
                      </button>
                      <button onClick={() => setDeleteTarget(assignment._id)} className="btn-ghost text-red-400 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Submissions modal */}
      {viewSubmissions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="fixed inset-0 bg-black/50" onClick={() => { setViewSubmissions(null); setGradingId(null); }} />
          <div className="relative z-10 w-full max-w-2xl max-h-[80vh] animate-scale-in overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Submissions for {viewSubmissions.title}</h2>
              <button onClick={() => { setViewSubmissions(null); setGradingId(null); }} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {loadingSubmissions ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-brand-500" />
              </div>
            ) : submissions.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">No submissions yet.</p>
            ) : (
              <div className="space-y-3">
                {submissions.map((sub) => {
                  const student = typeof sub.student === "object" ? sub.student : null;
                  const isGraded = sub.status === "graded";
                  return (
                    <div key={sub._id} className="rounded-lg border border-slate-100 p-4 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-600 dark:bg-brand-900/40 dark:text-brand-400">
                            {student?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{student?.name}</p>
                            <p className="text-xs text-slate-400">Submitted {new Date(sub.createdAt!).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {isGraded && (
                          <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                            {sub.marks}/{viewSubmissions.maxMarks}
                          </span>
                        )}
                      </div>

                      {sub.content && <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{sub.content}</p>}

                      {sub.attachments?.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {sub.attachments.map((att, i) => (
                            <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-brand-600 hover:underline">
                              <FileText size={12} /> {att.name}
                            </a>
                          ))}
                        </div>
                      )}

                      {sub.status === "late" && (
                        <p className="mt-1 text-xs text-amber-500">Submitted late</p>
                      )}

                      {isGraded ? (
                        <div className="mt-2 rounded-lg bg-emerald-50 p-2 text-sm dark:bg-emerald-950/20">
                          <p className="font-medium text-emerald-700 dark:text-emerald-400">Feedback: {sub.feedback || "No feedback"}</p>
                        </div>
                      ) : gradingId === sub._id ? (
                        <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                          <div>
                            <label className="text-xs text-slate-500">Marks (out of {viewSubmissions.maxMarks})</label>
                            <input
                              type="number"
                              value={gradeForm.marks}
                              onChange={(e) => setGradeForm({ ...gradeForm, marks: parseInt(e.target.value) || 0 })}
                              max={viewSubmissions.maxMarks}
                              min={0}
                              className="input-field"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-slate-500">Feedback</label>
                            <textarea
                              value={gradeForm.feedback}
                              onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                              rows={2}
                              placeholder="Provide feedback to the student..."
                              className="input-field resize-y"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleGrade(sub._id)} className="btn-primary text-sm">
                              <Award size={14} /> Submit Grade
                            </button>
                            <button onClick={() => setGradingId(null)} className="btn-ghost text-sm">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => { setGradingId(sub._id); setGradeForm({ marks: 0, feedback: "" }); }} className="btn-secondary mt-2 text-sm">
                          <Award size={14} /> Grade Submission
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete assignment?"
        message="This will delete the assignment and all student submissions."
        danger
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
