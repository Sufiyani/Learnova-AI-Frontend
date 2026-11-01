"use client";

import { useEffect, useState } from "react";
import {
  Brain,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  Loader2,
  History,
} from "lucide-react";
import { aiApi, quizApi, getErrorMessage } from "@/services/api";
import EmptyState from "@/components/ui/EmptyState";
import type { Quiz, QuizAttempt } from "@/types";
import toast from "react-hot-toast";

type QuizMode = "generate" | "taking" | "results" | "history";

export default function AIQuizPage() {
  const [mode, setMode] = useState<QuizMode>("generate");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [numQuestions, setNumQuestions] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [quiz, setQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<QuizAttempt[]>([]);

  useEffect(() => {
    if (mode === "history") fetchHistory();
  }, [mode]);

  const fetchHistory = async () => {
    try {
      const res = await quizApi.getMyHistory();
      setHistory(res.data.data.attempts || []);
    } catch (err) {
      // silent
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setGenerating(true);
    try {
      const res = await aiApi.generateQuiz({
        topic,
        difficulty,
        numQuestions,
        saveQuiz: true,
      });
      setQuiz(res.data.data.quiz);
      setAnswers({});
      setMode("taking");
      toast.success("Quiz generated!");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectAnswer = (questionIndex: number, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const handleSubmit = async () => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < quiz.questions.length) {
      toast.error("Please answer all questions before submitting");
      return;
    }
    setSubmitting(true);
    try {
      const formattedAnswers = quiz.questions.map((_: any, i: number) => ({
        selectedOption: answers[i],
      }));
      const res = await quizApi.submitAttempt(quiz._id, { answers: formattedAnswers });
      setResult(res.data.data);
      setMode("results");
      toast.success("Quiz submitted!");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setMode("generate");
    setQuiz(null);
    setResult(null);
    setAnswers({});
    setTopic("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">AI Quiz Generator</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Generate quizzes on any topic and test your knowledge.
        </p>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { key: "generate", label: "Generate", icon: Sparkles },
          { key: "history", label: "History", icon: History },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setMode(tab.key as QuizMode)}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              (mode === tab.key || (tab.key === "generate" && (mode === "taking" || mode === "results")))
                ? "border-brand-500 text-brand-600"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Generate mode */}
      {mode === "generate" && (
        <div className="card mx-auto max-w-2xl p-6">
          <form onSubmit={handleGenerate} className="space-y-5">
            <div>
              <label className="label-field">Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. JavaScript closures, React hooks, Big O notation..."
                className="input-field"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label-field">Difficulty</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="input-field">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="label-field">Number of Questions</label>
                <select value={numQuestions} onChange={(e) => setNumQuestions(parseInt(e.target.value))} className="input-field">
                  {[3, 5, 10, 15].map((n) => (
                    <option key={n} value={n}>{n} questions</option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" disabled={generating} className="btn-primary w-full">
              {generating ? (
                <>
                  <Loader2 className="animate-spin" size={16} /> Generating...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Generate Quiz
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Taking quiz mode */}
      {mode === "taking" && quiz && (
        <div className="mx-auto max-w-3xl space-y-4">
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{quiz.title}</h2>
                <p className="text-sm text-slate-500">
                  {quiz.questions.length} questions • {difficulty} difficulty
                </p>
              </div>
              <div className="text-sm text-slate-500">
                {Object.keys(answers).length}/{quiz.questions.length} answered
              </div>
            </div>
          </div>

          {quiz.questions.map((question: any, qIdx: number) => (
            <div key={qIdx} className="card p-5">
              <h3 className="mb-4 font-medium text-slate-900 dark:text-slate-100">
                {qIdx + 1}. {question.question}
              </h3>
              <div className="space-y-2">
                {question.options.map((option: string, optIdx: number) => (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectAnswer(qIdx, optIdx)}
                    className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left text-sm transition-all ${
                      answers[qIdx] === optIdx
                        ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-400"
                        : "border-slate-200 text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      answers[qIdx] === optIdx ? "border-brand-500 bg-brand-500" : "border-slate-300"
                    }`}>
                      {answers[qIdx] === optIdx && <CheckCircle2 size={12} className="text-white" />}
                    </div>
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button onClick={handleSubmit} disabled={submitting} className="btn-primary w-full">
            {submitting ? <Loader2 className="animate-spin" size={16} /> : "Submit Quiz"}
          </button>
        </div>
      )}

      {/* Results mode */}
      {mode === "results" && result && (
        <div className="mx-auto max-w-3xl space-y-4">
          {/* Score card */}
          <div className="card p-6 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-950/40">
              <Trophy className="h-10 w-10 text-brand-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {result.attempt.score}/{result.attempt.totalQuestions}
            </h2>
            <p className="mt-1 text-lg text-slate-600 dark:text-slate-400">{result.attempt.percentage}%</p>
            <div className={`mt-3 inline-flex rounded-full px-4 py-1 text-sm font-medium ${
              result.attempt.passed
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                : "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
            }`}>
              {result.attempt.passed ? "Passed" : "Keep practicing"}
            </div>
          </div>

          {/* Question review */}
          {result.questions.map((q: any, qIdx: number) => {
            const userAnswer = result.attempt.answers[qIdx];
            const isCorrect = userAnswer?.isCorrect;
            return (
              <div key={qIdx} className="card p-5">
                <div className="flex items-start gap-2">
                  {isCorrect ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                  ) : (
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900 dark:text-slate-100">
                      {qIdx + 1}. {q.question}
                    </h3>
                    <div className="mt-3 space-y-1.5">
                      {q.options.map((opt: string, optIdx: number) => (
                        <div
                          key={optIdx}
                          className={`rounded-lg px-3 py-2 text-sm ${
                            optIdx === q.correctAnswer
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                              : userAnswer?.selectedOption === optIdx
                              ? "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                              : "text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {optIdx === q.correctAnswer && "✓ "}
                          {userAnswer?.selectedOption === optIdx && optIdx !== q.correctAnswer && "✗ "}
                          {opt}
                        </div>
                      ))}
                    </div>
                    {q.explanation && (
                      <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        <strong>Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <button onClick={handleReset} className="btn-secondary w-full">
            <RotateCcw size={16} /> Generate Another Quiz
          </button>
        </div>
      )}

      {/* History mode */}
      {mode === "history" && (
        <div>
          {history.length === 0 ? (
            <EmptyState
              icon={History}
              title="No quiz history yet"
              description="Generate your first quiz to see results here."
              action={
                <button onClick={() => setMode("generate")} className="btn-primary">
                  Generate Quiz
                </button>
              }
            />
          ) : (
            <div className="space-y-3">
              {history.map((attempt) => (
                <div key={attempt._id} className="card flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      attempt.passed ? "bg-emerald-100 dark:bg-emerald-950/30" : "bg-red-100 dark:bg-red-950/30"
                    }`}>
                      <Trophy className={`h-5 w-5 ${attempt.passed ? "text-emerald-600" : "text-red-600"}`} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {typeof attempt.quiz === "object" ? attempt.quiz.title : "Quiz"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {attempt.score}/{attempt.totalQuestions} correct • {new Date(attempt.createdAt || "").toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${attempt.passed ? "text-emerald-600" : "text-red-600"}`}>
                      {attempt.percentage}%
                    </p>
                    <p className="text-xs text-slate-400">{attempt.passed ? "Passed" : "Failed"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
