"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BookOpen,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Save,
  Upload,
  Video,
  FileText,
  Users,
  Send,
  Loader2,
  PlayCircle,
  X,
  Edit3,
} from "lucide-react";
import {
  courseApi,
  categoryApi,
  enrollmentApi,
  fileToBase64,
  getErrorMessage,
} from "@/services/api";
import { FullPageSpinner } from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import type { Course, Section, Category, Enrollment as EnrollmentType } from "@/types";
import toast from "react-hot-toast";

type Tab = "overview" | "curriculum" | "students";

export default function CourseEditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [curriculum, setCurriculum] = useState<Section[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [showAddSection, setShowAddSection] = useState(false);
  const [showAddLesson, setShowAddLesson] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "section" | "lesson"; id: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);

  // Section form
  const [sectionTitle, setSectionTitle] = useState("");

  // Lesson form
  const [lessonForm, setLessonForm] = useState({ title: "", description: "", content: "", isPreview: false });
  const [lessonVideo, setLessonVideo] = useState<File | null>(null);
  const [lessonResources, setLessonResources] = useState<File[]>([]);
  const [uploadingForLesson, setUploadingForLesson] = useState<string | null>(null);

  // Course edit form
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    shortDescription: "",
    category: "",
    level: "beginner",
    isFree: true,
    price: 0,
    language: "English",
    tags: "",
  });

  useEffect(() => {
    fetchCourse();
    fetchCategories();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const res = await courseApi.getById(id);
      setCourse(res.data.data.course);
      setCurriculum(res.data.data.curriculum || []);
      setEditForm({
        title: res.data.data.course.title,
        description: res.data.data.course.description,
        shortDescription: res.data.data.course.shortDescription || "",
        category: typeof res.data.data.course.category === "object" ? res.data.data.course.category?._id : "",
        level: res.data.data.course.level,
        isFree: res.data.data.course.isFree,
        price: res.data.data.course.price,
        language: res.data.data.course.language || "English",
        tags: res.data.data.course.tags?.join(", ") || "",
      });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.list();
      setCategories(res.data.data.categories || []);
    } catch (err) {
      // silent
    }
  };

  const fetchEnrollments = async () => {
    try {
      const res = await enrollmentApi.getCourseEnrollments(id);
      setEnrollments(res.data.data.enrollments || []);
    } catch (err) {
      // silent
    }
  };

  // ─── Handlers ────────────────────────
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const tags = editForm.tags.split(",").map((t) => t.trim()).filter(Boolean);
      await courseApi.update(id, {
        title: editForm.title,
        description: editForm.description,
        shortDescription: editForm.shortDescription,
        category: editForm.category || undefined,
        level: editForm.level as "beginner" | "intermediate" | "advanced",
        isFree: editForm.isFree,
        price: editForm.isFree ? 0 : editForm.price,
        language: editForm.language,
        tags,
      });
      toast.success("Course updated");
      fetchCourse();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setThumbnailUploading(true);
    try {
      const base64File = await fileToBase64(file);
      await courseApi.uploadThumbnail(id, {
        buffer: base64File.buffer,
        mimetype: base64File.mimetype,
        originalname: base64File.originalname,
      });
      toast.success("Thumbnail updated");
      fetchCourse();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setThumbnailUploading(false);
    }
  };

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionTitle.trim()) return;
    try {
      await courseApi.addSection(id, { title: sectionTitle });
      toast.success("Section added");
      setSectionTitle("");
      setShowAddSection(false);
      fetchCourse();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleAddLesson = async (sectionId: string) => {
    if (!lessonForm.title.trim()) {
      toast.error("Lesson title is required");
      return;
    }
    try {
      await courseApi.addLesson(id, sectionId, {
        title: lessonForm.title,
        description: lessonForm.description,
        content: lessonForm.content,
        isPreview: lessonForm.isPreview,
      });
      toast.success("Lesson added");
      setLessonForm({ title: "", description: "", content: "", isPreview: false });
      setShowAddLesson(null);
      fetchCourse();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleUploadVideo = async (lessonId: string) => {
    if (!lessonVideo) return;
    if (lessonVideo.size > 500 * 1024 * 1024) {
      toast.error("Video must be under 500MB");
      return;
    }
    setUploadingForLesson(lessonId);
    try {
      const base64File = await fileToBase64(lessonVideo);
      await courseApi.uploadLessonVideo(lessonId, {
        buffer: base64File.buffer,
        mimetype: base64File.mimetype,
        originalname: base64File.originalname,
      });
      toast.success("Video uploaded");
      setLessonVideo(null);
      fetchCourse();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploadingForLesson(null);
    }
  };

  const handleUploadResource = async (lessonId: string) => {
    if (lessonResources.length === 0) return;
    setUploadingForLesson(lessonId);
    try {
      for (const file of lessonResources) {
        const base64File = await fileToBase64(file);
        await courseApi.uploadLessonResource(lessonId, {
          buffer: base64File.buffer,
          mimetype: base64File.mimetype,
          originalname: base64File.originalname,
        });
      }
      toast.success("Resources uploaded");
      setLessonResources([]);
      fetchCourse();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploadingForLesson(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "section") {
        await courseApi.deleteSection(id, deleteTarget.id);
        toast.success("Section deleted");
      } else {
        await courseApi.deleteLesson(deleteTarget.id);
        toast.success("Lesson deleted");
      }
      fetchCourse();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleSubmitForApproval = async () => {
    try {
      await courseApi.submitForApproval(id);
      toast.success("Course submitted for approval");
      fetchCourse();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  if (loading) return <FullPageSpinner />;
  if (!course) return <div className="p-8 text-center text-slate-500">Course not found.</div>;

  const tabs = [
    { key: "overview", label: "Overview", icon: Edit3 },
    { key: "curriculum", label: "Curriculum", icon: BookOpen },
    { key: "students", label: "Students", icon: Users },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <button onClick={() => router.push("/instructor/courses")} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            <X size={14} /> Back to courses
          </button>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{course.title}</h1>
          <div className="mt-1 flex items-center gap-2">
            {course.isPublished ? (
              <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">Published</span>
            ) : course.approvalStatus === "pending" ? (
              <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">Pending Approval</span>
            ) : course.approvalStatus === "rejected" ? (
              <span className="badge bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400">Rejected</span>
            ) : (
              <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">Draft</span>
            )}
          </div>
        </div>
        {!course.isPublished && course.approvalStatus !== "pending" && (
          <button onClick={handleSubmitForApproval} className="btn-primary">
            <Send size={16} /> Submit for Approval
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key);
              if (t.key === "students") fetchEnrollments();
            }}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.key
                ? "border-brand-500 text-brand-600"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === "overview" && (
        <div className="space-y-6">
          {/* Thumbnail */}
          <div className="card p-5">
            <h3 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Course Thumbnail</h3>
            <div className="flex items-center gap-4">
              <div className="h-28 w-48 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                {course.thumbnail?.url ? (
                  <img src={course.thumbnail.url} alt={course.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <BookOpen className="h-8 w-8 text-slate-300" />
                  </div>
                )}
              </div>
              <div>
                <label className="btn-secondary cursor-pointer">
                  {thumbnailUploading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} /> Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={16} /> Upload Thumbnail
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" />
                </label>
                <p className="mt-1 text-xs text-slate-400">Recommended: 1280x720px, max 5MB</p>
              </div>
            </div>
          </div>

          {/* Edit form */}
          <form onSubmit={handleSaveCourse} className="card space-y-4 p-5">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Course Details</h3>
            <div>
              <label className="label-field">Title</label>
              <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="label-field">Short Description</label>
              <input type="text" value={editForm.shortDescription} onChange={(e) => setEditForm({ ...editForm, shortDescription: e.target.value })} maxLength={250} className="input-field" />
            </div>
            <div>
              <label className="label-field">Description</label>
              <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={4} className="input-field resize-y" required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label-field">Category</label>
                <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className="input-field">
                  <option value="">No category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-field">Level</label>
                <select value={editForm.level} onChange={(e) => setEditForm({ ...editForm, level: e.target.value })} className="input-field">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label-field">Language</label>
                <input type="text" value={editForm.language} onChange={(e) => setEditForm({ ...editForm, language: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="label-field">Tags (comma-separated)</label>
                <input type="text" value={editForm.tags} onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })} className="input-field" />
              </div>
            </div>
            <div>
              <label className="label-field">Pricing</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input type="radio" checked={editForm.isFree} onChange={() => setEditForm({ ...editForm, isFree: true })} />
                  <span className="text-sm">Free</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" checked={!editForm.isFree} onChange={() => setEditForm({ ...editForm, isFree: false })} />
                  <span className="text-sm">Paid</span>
                </label>
                {!editForm.isFree && (
                  <input type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })} min={0} className="input-field w-32" />
                )}
              </div>
            </div>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save Changes
            </button>
          </form>
        </div>
      )}

      {/* Curriculum Tab */}
      {tab === "curriculum" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Curriculum</h2>
            <button onClick={() => setShowAddSection(!showAddSection)} className="btn-primary">
              <Plus size={16} /> Add Section
            </button>
          </div>

          {showAddSection && (
            <form onSubmit={handleAddSection} className="card flex gap-2 p-4">
              <input
                type="text"
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
                placeholder="Section title (e.g. Introduction, Chapter 1...)"
                className="input-field"
                autoFocus
              />
              <button type="submit" className="btn-primary">Add</button>
              <button type="button" onClick={() => setShowAddSection(false)} className="btn-ghost">Cancel</button>
            </form>
          )}

          {curriculum.length === 0 ? (
            <EmptyState icon={BookOpen} title="No sections yet" description="Add your first section to start building the curriculum." />
          ) : (
            <div className="space-y-3">
              {curriculum.map((section, sIdx) => (
                <div key={section._id} className="card overflow-hidden">
                  <div className="flex items-center justify-between bg-slate-50 px-4 py-3 dark:bg-slate-800/50">
                    <button onClick={() => toggleSection(section._id)} className="flex flex-1 items-center gap-2 text-left">
                      {expandedSections[section._id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      <span className="font-medium text-slate-900 dark:text-slate-100">{section.title}</span>
                      <span className="text-xs text-slate-400">({section.lessons?.length || 0} lessons)</span>
                    </button>
                    <button
                      onClick={() => setDeleteTarget({ type: "section", id: section._id })}
                      className="text-red-400 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {expandedSections[section._id] && (
                    <div className="p-3 space-y-2">
                      {section.lessons?.map((lesson, lIdx) => (
                        <div key={lesson._id} className="flex items-start gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                            {lesson.video?.url ? <PlayCircle size={16} className="text-brand-500" /> : <FileText size={16} className="text-slate-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{lesson.title}</p>
                            {lesson.video?.url && (
                              <a href={lesson.video.url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-600 hover:underline">View video</a>
                            )}
                            {/* Upload controls */}
                            <div className="mt-2 flex flex-wrap gap-2">
                              <label className="btn-ghost cursor-pointer text-xs">
                                <Video size={12} /> Upload Video
                                <input
                                  type="file"
                                  accept="video/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setLessonVideo(file);
                                      handleUploadVideo(lesson._id);
                                    }
                                  }}
                                />
                              </label>
                              <label className="btn-ghost cursor-pointer text-xs">
                                <Upload size={12} /> Upload Resource
                                <input
                                  type="file"
                                  multiple
                                  accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                                  className="hidden"
                                  onChange={(e) => {
                                    const files = Array.from(e.target.files || []);
                                    if (files.length > 0) {
                                      setLessonResources(files);
                                      handleUploadResource(lesson._id);
                                    }
                                  }}
                                />
                              </label>
                              {uploadingForLesson === lesson._id && <Loader2 className="animate-spin text-brand-500" size={16} />}
                            </div>
                            {lesson.resources?.length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {lesson.resources.map((res, ri) => (
                                  <a key={ri} href={res.url} target="_blank" rel="noopener noreferrer" className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                    {res.name}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => setDeleteTarget({ type: "lesson", id: lesson._id })}
                            className="text-red-400 hover:text-red-500"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}

                      {/* Add lesson form */}
                      {showAddLesson === section._id ? (
                        <div className="rounded-lg border border-brand-200 p-3 dark:border-brand-800">
                          <input
                            type="text"
                            value={lessonForm.title}
                            onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                            placeholder="Lesson title"
                            className="input-field mb-2"
                            autoFocus
                          />
                          <textarea
                            value={lessonForm.description}
                            onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                            placeholder="Lesson description (optional)"
                            rows={2}
                            className="input-field mb-2 resize-y"
                          />
                          <label className="flex items-center gap-2 mb-2">
                            <input
                              type="checkbox"
                              checked={lessonForm.isPreview}
                              onChange={(e) => setLessonForm({ ...lessonForm, isPreview: e.target.checked })}
                            />
                            <span className="text-sm text-slate-600 dark:text-slate-400">Free preview lesson</span>
                          </label>
                          <div className="flex gap-2">
                            <button onClick={() => handleAddLesson(section._id)} className="btn-primary text-sm">Add Lesson</button>
                            <button onClick={() => setShowAddLesson(null)} className="btn-ghost text-sm">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setShowAddLesson(section._id);
                            setLessonForm({ title: "", description: "", content: "", isPreview: false });
                          }}
                          className="btn-ghost w-full text-sm"
                        >
                          <Plus size={14} /> Add Lesson
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Students Tab */}
      {tab === "students" && (
        <div>
          {enrollments.length === 0 ? (
            <EmptyState icon={Users} title="No students enrolled yet" description="Students will appear here when they enroll in your course." />
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
                      <th className="px-4 py-3 font-medium">Student</th>
                      <th className="px-4 py-3 font-medium">Progress</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Enrolled Date</th>
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
                              <span className="text-slate-900 dark:text-slate-100">{student?.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{enr.progress}%</td>
                          <td className="px-4 py-3">
                            {enr.isCompleted ? (
                              <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">Completed</span>
                            ) : (
                              <span className="badge bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">In Progress</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-500">{new Date(enr.createdAt!).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={deleteTarget?.type === "section" ? "Delete section?" : "Delete lesson?"}
        message={deleteTarget?.type === "section" ? "This will delete the section and all its lessons. This cannot be undone." : "This will delete the lesson and its video/resources. This cannot be undone."}
        danger
        confirmText="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
