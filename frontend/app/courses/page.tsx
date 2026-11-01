"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import CourseCard from "@/components/CourseCard";
import { courseApi, categoryApi, getErrorMessage } from "@/services/api";
import { CourseCardSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { BookOpen } from "lucide-react";
import type { Course, Category } from "@/types";
import toast from "react-hot-toast";

function CoursesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [filters, setFilters] = useState({
    q: searchParams.get("q") || "",
    category: "",
    level: "",
    isFree: "",
    sort: "newest",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.list();
      setCategories(res.data.data.categories || []);
    } catch (err) {
      // silent
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | boolean> = {};
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params[k] = v;
      });
      const res = await courseApi.list(params);
      setCourses(res.data.data || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, q: query }));
  };

  const updateFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value || "" }));
  };

  const clearFilters = () => {
    setFilters({ q: "", category: "", level: "", isFree: "", sort: "newest" });
    setQuery("");
  };

  const hasActiveFilters = filters.category || filters.level || filters.isFree;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Explore Courses</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Discover courses across multiple categories and start learning today.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search courses..."
                className="input-field pl-10"
              />
            </div>
            <button type="submit" className="btn-primary">Search</button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary lg:hidden"
            >
              <SlidersHorizontal size={16} />
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-6">
          {/* Filters sidebar */}
          <aside className={`${showFilters ? "block" : "hidden"} lg:block w-full lg:w-64 shrink-0`}>
            <div className="card p-4 space-y-5 sticky top-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Filters</h3>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs text-brand-600 hover:text-brand-700">
                    Clear all
                  </button>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="label-field">Category</label>
                <select value={filters.category} onChange={(e) => updateFilter("category", e.target.value)} className="input-field">
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Level */}
              <div>
                <label className="label-field">Difficulty</label>
                <select value={filters.level} onChange={(e) => updateFilter("level", e.target.value)} className="input-field">
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="label-field">Price</label>
                <select value={filters.isFree} onChange={(e) => updateFilter("isFree", e.target.value)} className="input-field">
                  <option value="">All Courses</option>
                  <option value="true">Free Only</option>
                  <option value="false">Paid Only</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="label-field">Sort By</label>
                <select value={filters.sort} onChange={(e) => updateFilter("sort", e.target.value)} className="input-field">
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="rating-desc">Highest Rated</option>
                  <option value="students-desc">Most Popular</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Courses grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <CourseCardSkeleton key={i} />
                ))}
              </div>
            ) : courses.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No courses found"
                description="Try adjusting your filters or search query."
                action={<button onClick={clearFilters} className="btn-primary">Clear filters</button>}
              />
            ) : (
              <>
                <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                  {courses.length} course{courses.length !== 1 && "s"} found
                </p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {courses.map((course) => (
                    <CourseCard key={course._id} course={course} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" /></div>}>
      <CoursesContent />
    </Suspense>
  );
}