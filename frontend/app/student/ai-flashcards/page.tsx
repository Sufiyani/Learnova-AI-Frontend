"use client";

import { useEffect, useState } from "react";
import {
  Layers,
  Sparkles,
  Loader2,
  Plus,
  Trash2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Layers3,
} from "lucide-react";
import { aiApi, getErrorMessage } from "@/services/api";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import type { FlashcardSet } from "@/types";
import toast from "react-hot-toast";

type View = "list" | "generate" | "study";

export default function AIFlashcardsPage() {
  const [view, setView] = useState<View>("list");
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [topicOrText, setTopicOrText] = useState("");
  const [count, setCount] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Study mode state
  const [studySet, setStudySet] = useState<FlashcardSet | null>(null);
  const [currentCard, setCurrentCard] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    fetchSets();
  }, []);

  const fetchSets = async () => {
    try {
      const res = await aiApi.getFlashcardSets({ limit: 50 });
      setSets(res.data.data.flashcardSets || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicOrText.trim()) return;
    setGenerating(true);
    try {
      await aiApi.generateFlashcards({ topicOrText, count, saveSet: true });
      toast.success("Flashcards generated!");
      setTopicOrText("");
      setView("list");
      fetchSets();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const startStudy = async (set: FlashcardSet) => {
    setStudySet(set);
    setCurrentCard(0);
    setFlipped(false);
    setView("study");
  };

  const finishStudy = async () => {
    if (!studySet) return;
    try {
      await aiApi.recordStudy(studySet._id);
      toast.success("Study session recorded!");
    } catch (err) {
      // silent
    }
    setStudySet(null);
    setView("list");
    fetchSets();
  };

  const nextCard = () => {
    if (!studySet) return;
    setFlipped(false);
    setCurrentCard((prev) => (prev + 1) % studySet.cards.length);
  };

  const prevCard = () => {
    if (!studySet) return;
    setFlipped(false);
    setCurrentCard((prev) => (prev - 1 + studySet.cards.length) % studySet.cards.length);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await aiApi.deleteFlashcardSet(deleteTarget);
      toast.success("Flashcard set deleted");
      setDeleteTarget(null);
      fetchSets();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  // ─── Study View ──────────────────────────
  if (view === "study" && studySet) {
    const card = studySet.cards[currentCard];
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <button onClick={() => { setView("list"); setStudySet(null); }} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
              <ChevronLeft size={16} /> Back to sets
            </button>
            <h1 className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">{studySet.title}</h1>
          </div>
          <div className="text-sm text-slate-500">
            Card {currentCard + 1} of {studySet.cards.length}
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5">
          {studySet.cards.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === currentCard ? "w-8 bg-brand-500" : "w-1.5 bg-slate-300 dark:bg-slate-700"}`}
            />
          ))}
        </div>

        {/* Flashcard */}
        <div className="flex justify-center" style={{ perspective: "1000px" }}>
          <div
            onClick={() => setFlipped(!flipped)}
            className="relative h-72 w-full max-w-lg cursor-pointer"
            style={{ transformStyle: "preserve-3d", transition: "transform 0.6s", transform: flipped ? "rotateY(180deg)" : "" }}
          >
            {/* Front */}
            <div
              className="card absolute inset-0 flex items-center justify-center p-8 text-center"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div>
                <p className="mb-2 text-xs uppercase tracking-wide text-brand-500 font-semibold">Question</p>
                <p className="text-xl font-medium text-slate-900 dark:text-slate-100">{card.front}</p>
                <p className="mt-6 text-xs text-slate-400">Click to flip</p>
              </div>
            </div>
            {/* Back */}
            <div
              className="card absolute inset-0 flex items-center justify-center p-8 text-center bg-brand-50 dark:bg-brand-950/20"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              <div>
                <p className="mb-2 text-xs uppercase tracking-wide text-emerald-500 font-semibold">Answer</p>
                <p className="text-lg text-slate-700 dark:text-slate-300">{card.back}</p>
                <p className="mt-6 text-xs text-slate-400">Click to flip back</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button onClick={prevCard} className="btn-secondary">
            <ChevronLeft size={16} /> Previous
          </button>
          <button onClick={() => setFlipped(!flipped)} className="btn-primary">
            <RotateCcw size={16} /> Flip
          </button>
          <button onClick={nextCard} className="btn-secondary">
            Next <ChevronRight size={16} />
          </button>
        </div>

        <div className="flex justify-center">
          <button onClick={finishStudy} className="btn-primary">
            <CheckCircle2 size={16} /> Finish & Save Session
          </button>
        </div>
      </div>
    );
  }

  // ─── Generate View ────────────────────────
  if (view === "generate") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Generate Flashcards</h1>
          <button onClick={() => setView("list")} className="btn-ghost">Cancel</button>
        </div>

        <div className="card mx-auto max-w-2xl p-6">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="label-field">Topic or Text</label>
              <textarea
                value={topicOrText}
                onChange={(e) => setTopicOrText(e.target.value)}
                placeholder="Enter a topic (e.g. 'World War II') or paste text to generate flashcards from..."
                rows={5}
                className="input-field resize-y"
                required
              />
            </div>
            <div>
              <label className="label-field">Number of Cards</label>
              <select value={count} onChange={(e) => setCount(parseInt(e.target.value))} className="input-field">
                {[5, 10, 15, 20].map((n) => (
                  <option key={n} value={n}>{n} cards</option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={generating} className="btn-primary w-full">
              {generating ? (
                <>
                  <Loader2 className="animate-spin" size={16} /> Generating...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Generate Flashcards
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── List View ────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">AI Flashcards</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Generate and study flashcards to reinforce your learning.
          </p>
        </div>
        <button onClick={() => setView("generate")} className="btn-primary">
          <Plus size={16} /> Generate
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-brand-500" />
        </div>
      ) : sets.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No flashcard sets yet"
          description="Generate your first set of AI-powered flashcards."
          action={<button onClick={() => setView("generate")} className="btn-primary">Generate Flashcards</button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sets.map((set) => (
            <div key={set._id} className="card group p-4">
              <div className="flex items-start justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950/40">
                  <Layers3 className="h-5 w-5 text-brand-600" />
                </div>
                <button
                  onClick={() => setDeleteTarget(set._id)}
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4 text-red-400 hover:text-red-500" />
                </button>
              </div>
              <h3 className="mt-3 font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">{set.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{set.cards.length} cards</p>
              {set.topic && <p className="mt-1 text-xs text-slate-400 line-clamp-1">{set.topic}</p>}
              {set.sessionsCompleted > 0 && (
                <p className="mt-1 text-xs text-emerald-500">{set.sessionsCompleted} sessions completed</p>
              )}
              <button onClick={() => startStudy(set)} className="btn-primary mt-3 w-full text-sm">
                Study Now
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete flashcard set?"
        message="This will permanently delete the flashcard set."
        danger
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
