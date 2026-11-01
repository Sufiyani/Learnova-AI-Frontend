"use client";

import { useEffect, useState } from "react";
import { FolderTree, Plus, Trash2, Loader2, Save, Edit3, X } from "lucide-react";
import { categoryApi, getErrorMessage } from "@/services/api";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import type { Category } from "@/types";
import toast from "react-hot-toast";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", icon: "BookOpen", color: "#6366f1" });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.list();
      setCategories(res.data.data.categories || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await categoryApi.update(editing._id, form);
        toast.success("Category updated");
      } else {
        await categoryApi.create(form);
        toast.success("Category created");
      }
      setForm({ name: "", description: "", icon: "BookOpen", color: "#6366f1" });
      setEditing(null);
      setShowForm(false);
      fetchCategories();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description, icon: cat.icon, color: cat.color });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await categoryApi.delete(deleteTarget);
      toast.success("Category deleted");
      setDeleteTarget(null);
      fetchCategories();
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Categories</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{categories.length} course categories</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ name: "", description: "", icon: "BookOpen", color: "#6366f1" }); }} className="btn-primary">
          <Plus size={16} /> {showForm ? "Cancel" : "Add Category"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4 p-5">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">{editing ? "Edit Category" : "New Category"}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-field">Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="label-field">Color</label>
              <div className="flex gap-2">
                <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="h-10 w-16 rounded-lg border border-slate-300 dark:border-slate-700" />
                <input type="text" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="input-field" />
              </div>
            </div>
          </div>
          <div>
            <label className="label-field">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="input-field resize-y" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} {editing ? "Update" : "Create"}
          </button>
        </form>
      )}

      {/* Categories list */}
      {!showForm && (
        categories.length === 0 ? (
          <EmptyState icon={FolderTree} title="No categories yet" description="Create your first course category." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <div key={cat._id} className="card group p-4">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${cat.color}20` }}>
                    <FolderTree className="h-5 w-5" style={{ color: cat.color }} />
                  </div>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button onClick={() => handleEdit(cat)} className="text-slate-400 hover:text-brand-600">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => setDeleteTarget(cat._id)} className="text-slate-400 hover:text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <h3 className="mt-3 font-semibold text-slate-900 dark:text-slate-100">{cat.name}</h3>
                <p className="mt-1 text-sm text-slate-500 line-clamp-2">{cat.description || "No description"}</p>
                {cat.courseCount !== undefined && (
                  <p className="mt-2 text-xs text-slate-400">{cat.courseCount} courses</p>
                )}
              </div>
            ))}
          </div>
        )
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete category?"
        message="This will delete the category. Courses using it will have no category assigned. Cannot be undone if courses still reference it."
        danger
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
