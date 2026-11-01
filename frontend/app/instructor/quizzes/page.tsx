"use client";

import { useEffect, useState } from "react";
import {
  Brain,
  Plus,
  Trash2,
  Loader2,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Trash,
  Eye,
} from "lucide-react";
import { quizApi, courseApi, getErrorMessage } from "@/services/api";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import type { Quiz, Course, QuizQuestion } from "@/types";
import toast from "react-hot-toast";

export default function InstructorQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [viewResults, setViewResults] = useState<Quiz | null>(null);
  const [results, setResults] = useState<any[]>([]);

  // Create form
  const [quizForm, setQuizForm] = useState({
    title: "",
    description: "",
    course: "",
    difficulty: "medium",
    duration: 30,
    passScore: 60,
    questions: [{ question: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" }] as QuizQuestion[],
  });

  useEffect(() => {
    fetchQuizzes();
    fetchCourses();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await quizApi.list({ limit: 100 });
      setQuizzes(res.data.data || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await courseApi.getInstructorCourses();
      setCourses(res.data.data.courses || []);
    } catch (err) {
      // silent
    }
  };

  const handleAddQuestion = () => {
    setQuizForm({
      ...quizForm,
      questions: [
        ...quizForm.questions,
        { question: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" },
      ],
    });
  };

  const handleRemoveQuestion = (index: number) => {
    setQuizForm({
      ...quizForm,
      questions: quizForm.questions.filter((_, i) => i !== index),
    });
  };

  const handleQuestionChange = (qIndex: number, field: string, value: any) => {
    const questions = [...quizForm.questions];
    (questions[qIndex] as any)[field] = value;
    setQuizForm({ ...quizForm, questions });
  };

  const handleOptionChange = (qIndex: number, optIndex: number, value: string) => {
    const questions = [...quizForm.questions];
    questions[qIndex].options[optIndex] = value;
    setQuizForm({ ...quizForm, questions });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate
    for (const q of quizForm.questions) {
      if (!q.question.trim() || q.options.some((o) => !o.trim())) {
        toast.error("Please fill in all questions and options");
        return;
      }
    }
    try {
      await quizApi.create({
        title: quizForm.title,
        description: quizForm.description,
        course: quizForm.course || undefined,
        difficulty: quizForm.difficulty as "easy" | "medium" | "hard",
        duration: quizForm.duration,
        passScore: quizForm.passScore,
        questions: quizForm.questions,
      });
      toast.success("Quiz created successfully");
      setShowCreateForm(false);
      setQuizForm({
        title: "",
        description: "",
        course: "",
        difficulty: "medium",
        duration: 30,
        passScore: 60,
        questions: [{ question: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" }],
      });
      fetchQuizzes();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleViewResults = async (quiz: Quiz) => {
    setViewResults(quiz);
    try {
      const res = await quizApi.getAttempts(quiz._id);
      setResults(res.data.data.attempts || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await quizApi.delete(deleteTarget);
      toast.success("Quiz deleted");
      setDeleteTarget(null);
      fetchQuizzes();
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Quiz Manager</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create and manage quizzes for your courses.</p>
        </div>
        <button onClick={() => setShowCreateForm(!showCreateForm)} className="btn-primary">
          <Plus size={16} /> {showCreateForm ? "Cancel" : "Create Quiz"}
        </button>
      </div>

      {/* Create form */}
      {showCreateForm && (
        <form onSubmit={handleCreate} className="card space-y-5 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-field">Quiz Title *</label>
              <input type="text" value={quizForm.title} onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="label-field">Course (optional)</label>
              <select value={quizForm.course} onChange={(e) => setQuizForm({ ...quizForm, course: e.target.value })} className="input-field">
                <option value="">No specific course</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>{c.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label-field">Description</label>
            <textarea value={quizForm.description} onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })} rows={2} className="input-field resize-y" />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label-field">Difficulty</label>
              <select value={quizForm.difficulty} onChange={(e) => setQuizForm({ ...quizForm, difficulty: e.target.value })} className="input-field">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="label-field">Duration (min)</label>
              <input type="number" value={quizForm.duration} onChange={(e) => setQuizForm({ ...quizForm, duration: parseInt(e.target.value) || 30 })} min={1} className="input-field" />
            </div>
            <div>
              <label className="label-field">Pass Score (%)</label>
              <input type="number" value={quizForm.passScore} onChange={(e) => setQuizForm({ ...quizForm, passScore: parseInt(e.target.value) || 60 })} min={0} max={100} className="input-field" />
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Questions ({quizForm.questions.length})</h3>
              <button type="button" onClick={handleAddQuestion} className="btn-secondary text-sm">
                <Plus size={14} /> Add Question
              </button>
            </div>

            {quizForm.questions.map((q, qIdx) => (
              <div key={qIdx} className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Question {qIdx + 1}</span>
                  {quizForm.questions.length > 1 && (
                    <button type="button" onClick={() => handleRemoveQuestion(qIdx)} className="text-red-400 hover:text-red-500">
                      <Trash size={14} />
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => handleQuestionChange(qIdx, "question", e.target.value)}
                  placeholder="Enter the question..."
                  className="input-field mb-3"
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  {q.options.map((opt, optIdx) => (
                    <div key={optIdx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${qIdx}`}
                        checked={q.correctAnswer === optIdx}
                        onChange={() => handleQuestionChange(qIdx, "correctAnswer", optIdx)}
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                        className="input-field text-sm"
                      />
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-400">Select the radio button for the correct answer.</p>
                <input
                  type="text"
                  value={q.explanation}
                  onChange={(e) => handleQuestionChange(qIdx, "explanation", e.target.value)}
                  placeholder="Explanation (optional)"
                  className="input-field mt-2 text-sm"
                />
              </div>
            ))}
          </div>

          <button type="submit" className="btn-primary w-full">
            <Save size={16} /> Create Quiz
          </button>
        </form>
      )}

      {/* Quiz list */}
      {!showCreateForm && (
        <>
          {quizzes.length === 0 ? (
            <EmptyState
              icon={Brain}
              title="No quizzes yet"
              description="Create your first quiz to test your students."
              action={<button onClick={() => setShowCreateForm(true)} className="btn-primary">Create Quiz</button>}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {quizzes.map((quiz) => (
                <div key={quiz._id} className="card group p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950/40">
                      <Brain className="h-5 w-5 text-brand-600" />
                    </div>
                    <button onClick={() => setDeleteTarget(quiz._id)} className="opacity-0 transition-opacity group-hover:opacity-100">
                      <Trash2 className="h-4 w-4 text-red-400 hover:text-red-500" />
                    </button>
                  </div>
                  <h3 className="mt-3 font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">{quiz.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{quiz.questions.length} questions</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">{quiz.difficulty}</span>
                    <span className="badge bg-brand-50 text-brand-600 dark:bg-brand-950/30 dark:text-brand-400">{quiz.duration} min</span>
                    {quiz.type === "ai-generated" && (
                      <span className="badge bg-purple-100 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400">AI</span>
                    )}
                  </div>
                  <button onClick={() => handleViewResults(quiz)} className="btn-secondary mt-3 w-full text-sm">
                    <Eye size={14} /> View Results
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Results modal */}
      {viewResults && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="fixed inset-0 bg-black/50" onClick={() => setViewResults(null)} />
          <div className="relative z-10 w-full max-w-lg max-h-[80vh] animate-scale-in overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Results: {viewResults.title}</h2>
              <button onClick={() => setViewResults(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            {results.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">No attempts yet.</p>
            ) : (
              <div className="space-y-2">
                {results.map((attempt) => (
                  <div key={attempt._id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{attempt.student?.name || "Student"}</p>
                      <p className="text-xs text-slate-400">{new Date(attempt.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${attempt.passed ? "text-emerald-600" : "text-red-600"}`}>
                        {attempt.percentage}%
                      </p>
                      <p className="text-xs text-slate-400">{attempt.score}/{attempt.totalQuestions}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete quiz?"
        message="This will permanently delete the quiz and all student attempts."
        danger
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
