"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Sparkles,
  Loader2,
  Trash2,
  Plus,
  ListChecks,
  StickyNote,
} from "lucide-react";
import { aiApi, getErrorMessage } from "@/services/api";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import type { AINote } from "@/types";
import toast from "react-hot-toast";

export default function AINotesPage() {
  const [notes, setNotes] = useState<AINote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [content, setContent] = useState("");
  const [noteType, setNoteType] = useState("summary");
  const [title, setTitle] = useState("");
  const [generating, setGenerating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [viewNote, setViewNote] = useState<AINote | null>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await aiApi.getNotes({ limit: 50 });
      setNotes(res.data.data.notes || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || content.trim().length < 10) {
      toast.error("Please provide at least a few sentences");
      return;
    }
    setGenerating(true);
    try {
      await aiApi.generateNotes({ content, noteType, title });
      toast.success("Notes generated successfully!");
      setContent("");
      setTitle("");
      setShowGenerator(false);
      fetchNotes();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await aiApi.deleteNote(deleteTarget);
      toast.success("Note deleted");
      setDeleteTarget(null);
      fetchNotes();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const noteTypeLabels: Record<string, string> = {
    summary: "Summary",
    notes: "Study Notes",
    revision: "Revision Notes",
    takeaways: "Key Takeaways",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">AI Notes & Summarization</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Summarize content and generate structured study notes with AI.
          </p>
        </div>
        <button onClick={() => setShowGenerator(!showGenerator)} className="btn-primary">
          <Plus size={16} /> {showGenerator ? "Cancel" : "New Notes"}
        </button>
      </div>

      {/* Generator form */}
      {showGenerator && (
        <div className="card p-6">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="label-field">Title (optional)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Chapter 5 - Data Structures"
                className="input-field"
              />
            </div>
            <div>
              <label className="label-field">Note Type</label>
              <select value={noteType} onChange={(e) => setNoteType(e.target.value)} className="input-field">
                <option value="summary">Summary — concise overview</option>
                <option value="notes">Study Notes — structured notes</option>
                <option value="revision">Revision Notes — key points for review</option>
                <option value="takeaways">Key Takeaways — most important insights</option>
              </select>
            </div>
            <div>
              <label className="label-field">Content to Process</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste the text content you want to summarize or generate notes from..."
                rows={8}
                className="input-field resize-y"
                required
              />
              <p className="mt-1 text-xs text-slate-400">{content.length} characters</p>
            </div>
            <button type="submit" disabled={generating} className="btn-primary w-full">
              {generating ? (
                <>
                  <Loader2 className="animate-spin" size={16} /> Generating...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Generate Notes
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Notes list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-brand-500" />
        </div>
      ) : notes.length === 0 && !showGenerator ? (
        <EmptyState
          icon={FileText}
          title="No notes yet"
          description="Generate your first AI-powered notes by pasting content above."
          action={<button onClick={() => setShowGenerator(true)} className="btn-primary">Generate Notes</button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <div key={note._id} className="card group p-4">
              <div className="flex items-start justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950/40">
                  <FileText className="h-5 w-5 text-brand-600" />
                </div>
                <button
                  onClick={() => setDeleteTarget(note._id)}
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4 text-red-400 hover:text-red-500" />
                </button>
              </div>
              <h3 className="mt-3 font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">{note.title}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{note.summary}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  {noteTypeLabels[note.noteType] || note.noteType}
                </span>
                {note.keyPoints?.length > 0 && (
                  <span className="badge bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                    {note.keyPoints.length} key points
                  </span>
                )}
              </div>
              <button
                onClick={() => setViewNote(note)}
                className="mt-3 text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                View full notes →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Note viewer modal */}
      {viewNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="fixed inset-0 bg-black/50" onClick={() => setViewNote(null)} />
          <div className="relative z-10 w-full max-w-2xl max-h-[80vh] animate-scale-in overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{viewNote.title}</h2>
              <button onClick={() => setViewNote(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-500 uppercase tracking-wide">Summary</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300">{viewNote.summary}</p>
              </div>

              {viewNote.keyPoints?.length > 0 && (
                <div>
                  <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-500 uppercase tracking-wide">
                    <ListChecks size={14} /> Key Points
                  </h3>
                  <ul className="space-y-1.5">
                    {viewNote.keyPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <span className="mt-0.5 text-brand-500">•</span> {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {viewNote.takeaways?.length > 0 && (
                <div>
                  <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-500 uppercase tracking-wide">
                    <StickyNote size={14} /> Takeaways
                  </h3>
                  <ul className="space-y-1.5">
                    {viewNote.takeaways.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <span className="mt-0.5 text-brand-500">→</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete note?"
        message="This will permanently delete the note."
        danger
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
