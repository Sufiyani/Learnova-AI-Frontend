"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { courseApi, categoryApi, getErrorMessage } from "@/services/api";
import type { Category } from "@/types";
import toast from "react-hot-toast";

export default function CreateCoursePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
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
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.list();
      setCategories(res.data.data.categories || []);
    } catch (err) {
      // silent
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
      const res = await courseApi.create({
        title: form.title,
        description: form.description,
        shortDescription: form.shortDescription,
        category: form.category || undefined,
        level: form.level as "beginner" | "intermediate" | "advanced",
        isFree: form.isFree,
        price: form.isFree ? 0 : form.price,
        language: form.language,
        tags,
      });
      toast.success("Course created! Add sections and lessons next.");
      router.push(`/instructor/courses/${res.data.data.course._id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Create New Course</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Fill in the details below to create your course.</p>
      </div>

      <form onSubmit={handleSubmit} className="card mx-auto max-w-3xl space-y-5 p-6">
        <div>
          <label className="label-field">Course Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Complete JavaScript Bootcamp"
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="label-field">Short Description</label>
          <input
            type="text"
            value={form.shortDescription}
            onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
            placeholder="A brief one-line description (max 250 chars)"
            maxLength={250}
            className="input-field"
          />
        </div>

        <div>
          <label className="label-field">Full Description *</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe what students will learn in this course..."
            rows={5}
            className="input-field resize-y"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label-field">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-field">Difficulty Level</label>
            <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="input-field">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label-field">Language</label>
            <input
              type="text"
              value={form.language}
              onChange={(e) => setForm({ ...form, language: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="label-field">Tags (comma-separated)</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="javascript, web, frontend"
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="label-field">Pricing</label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={form.isFree}
                onChange={() => setForm({ ...form, isFree: true })}
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">Free</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={!form.isFree}
                onChange={() => setForm({ ...form, isFree: false })}
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">Paid</span>
            </label>
            {!form.isFree && (
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                placeholder="Price in $"
                min={0}
                className="input-field w-32"
              />
            )}
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? (
            <>
              <Loader2 className="animate-spin" size={16} /> Creating...
            </>
          ) : (
            <>
              <Save size={16} /> Create Course
            </>
          )}
        </button>
      </form>
    </div>
  );
}
