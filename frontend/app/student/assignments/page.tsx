"use client";

import { useEffect, useState } from "react";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Upload,
  Loader2,
  FileText,
  X,
} from "lucide-react";
import { enrollmentApi, assignmentApi, submissionApi, fileToBase64, getErrorMessage } from "@/services/api";
import EmptyState from "@/components/ui/EmptyState";
import type { Enrollment, Assignment, AssignmentSubmission } from "@/types";
import toast from "react-hot-toast";

export default function StudentAssignmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submissionContent, setSubmissionContent] = useState("");
  const [submissionFiles, setSubmissionFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const enrRes = await enrollmentApi.getMyEnrollments();
      const enrolledCourses = Array.isArray(enrRes.data.data) ? enrRes.data.data : [];
      setEnrollments(enrolledCourses);

      const allAssignments: Assignment[] = [];
      for (const enr of enrolledCourses) {
        try {
          const res = await assignmentApi.getByCourse(enr.course._id);
          const courseAssignments = res.data.data.assignments || [];
          allAssignments.push(...courseAssignments);
        } catch (err) {
          // Skip courses with no assignments
        }
      }
      setAssignments(allAssignments);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxSize = 25 * 1024 * 1024; // 25MB
    const validFiles = files.filter((f) => {
      if (f.size > maxSize) {
        toast.error(`${f.name} exceeds 25MB limit`);
        return false;
      }
      return true;
    });
    setSubmissionFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSubmissionFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    setSubmitting(true);
    try {
      // Convert files to base64
      const attachments: any[] = [];
      for (const file of submissionFiles) {
        const base64File = await fileToBase64(file);
        attachments.push({
          buffer: base64File.buffer,
          mimetype: base64File.mimetype,
          name: base64File.originalname,
        });
      }

      await submissionApi.submit(selectedAssignment._id, {
        content: submissionContent,
        attachments,
      });

      toast.success("Assignment submitted successfully!");
      setShowSubmitForm(false);
      setSubmissionContent("");
      setSubmissionFiles([]);
      setSelectedAssignment(null);
      fetchAssignments();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusInfo = (assignment: Assignment) => {
    const sub = assignment.submission as AssignmentSubmission;
    if (!sub) {
      const deadline = new Date(assignment.deadline);
      const isOverdue = deadline < new Date();
      return {
        icon: isOverdue ? XCircle : Clock,
        label: isOverdue ? "Overdue" : "Not submitted",
        color: isOverdue ? "text-red-500" : "text-amber-500",
      };
    }
    if (sub.status === "graded") {
      return {
        icon: CheckCircle2,
        label: `Graded: ${sub.marks}/${assignment.maxMarks}`,
        color: "text-emerald-500",
      };
    }
    if (sub.status === "late" || sub.isLate) {
      return {
        icon: AlertCircle,
        label: "Submitted (Late)",
        color: "text-amber-500",
      };
    }
    return {
      icon: CheckCircle2,
      label: "Submitted",
      color: "text-blue-500",
    };
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
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">My Assignments</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {assignments.length} assignment{assignments.length !== 1 && "s"} across your courses
        </p>
      </div>

      {assignments.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No assignments yet"
          description="Assignments will appear here when your instructors create them."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {assignments.map((assignment) => {
            const status = getStatusInfo(assignment);
            const course = typeof assignment.course === "object" ? assignment.course : null;
            const deadline = new Date(assignment.deadline);
            const isOverdue = deadline < new Date() && !assignment.submission;

            return (
              <div key={assignment._id} className="card p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{assignment.title}</h3>
                    {course && <p className="mt-0.5 text-xs text-brand-600">{course.title}</p>}
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs font-medium ${status.color}`}>
                    <status.icon size={14} /> {status.label}
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{assignment.description}</p>

                <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                  <span className={`flex items-center gap-1 ${isOverdue ? "text-red-500" : ""}`}>
                    <Clock size={12} /> Due {deadline.toLocaleDateString()}
                  </span>
                  <span>Max marks: {assignment.maxMarks}</span>
                </div>

                {/* Graded feedback */}
                {assignment.submission && (assignment.submission as AssignmentSubmission).status === "graded" && (
                  <div className="mt-3 rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/20">
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Instructor Feedback</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      {(assignment.submission as AssignmentSubmission).feedback || "No feedback provided."}
                    </p>
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setSelectedAssignment(assignment)}
                    className="btn-secondary text-sm"
                  >
                    View Details
                  </button>
                  {(!assignment.submission || (assignment.submission as AssignmentSubmission).status === "graded") && (
                    <button
                      onClick={() => {
                        setSelectedAssignment(assignment);
                        setShowSubmitForm(true);
                      }}
                      className="btn-primary text-sm"
                    >
                      <Upload size={14} /> Submit
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Assignment detail / submission modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="fixed inset-0 bg-black/50" onClick={() => { setSelectedAssignment(null); setShowSubmitForm(false); }} />
          <div className="relative z-10 w-full max-w-lg max-h-[80vh] animate-scale-in overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{selectedAssignment.title}</h2>
              <button onClick={() => { setSelectedAssignment(null); setShowSubmitForm(false); }} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Description</h3>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{selectedAssignment.description}</p>
              </div>

              {selectedAssignment.instructions && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Instructions</h3>
                  <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{selectedAssignment.instructions}</p>
                </div>
              )}

              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Deadline:</span>{" "}
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {new Date(selectedAssignment.deadline).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Max Marks:</span>{" "}
                  <span className="font-medium text-slate-900 dark:text-slate-100">{selectedAssignment.maxMarks}</span>
                </div>
              </div>

              {/* Resources */}
              {selectedAssignment.attachments?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Resources</h3>
                  <div className="mt-2 space-y-1">
                    {selectedAssignment.attachments.map((att, i) => (
                      <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-brand-600 hover:underline">
                        <FileText size={14} /> {att.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit form */}
              {showSubmitForm && (
                <form onSubmit={handleSubmit} className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800 space-y-4">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">Submit Assignment</h3>
                  <div>
                    <label className="label-field">Comments (optional)</label>
                    <textarea
                      value={submissionContent}
                      onChange={(e) => setSubmissionContent(e.target.value)}
                      rows={3}
                      className="input-field resize-y"
                      placeholder="Add any comments for your instructor..."
                    />
                  </div>
                  <div>
                    <label className="label-field">Upload Files</label>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx"
                    />
                    <label htmlFor="file-upload" className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 p-6 text-sm text-slate-500 hover:border-brand-300 dark:border-slate-700">
                      <Upload size={18} /> Click to upload files
                    </label>
                    {submissionFiles.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {submissionFiles.map((file, i) => (
                          <div key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 text-sm dark:bg-slate-800">
                            <span className="truncate">{file.name}</span>
                            <button type="button" onClick={() => removeFile(i)}>
                              <X size={14} className="text-red-400" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button type="submit" disabled={submitting} className="btn-primary w-full">
                    {submitting ? (
                      <>
                        <Loader2 className="animate-spin" size={16} /> Submitting...
                      </>
                    ) : (
                      "Submit Assignment"
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
