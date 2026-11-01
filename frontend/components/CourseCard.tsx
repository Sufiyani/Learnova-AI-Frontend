"use client";

import Link from "next/link";
import { Star, Users, BookOpen } from "lucide-react";
import type { Course } from "@/types";

const levelColors = {
  beginner: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  intermediate: "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
  advanced: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400",
};

export default function CourseCard({ course }: { course: Course }) {
  const instructor = typeof course.instructor === "object" ? course.instructor : null;

  return (
    <Link href={`/courses/${course._id}`} className="group block">
      <div className="card overflow-hidden transition-all hover:shadow-md">
        {/* Thumbnail */}
        <div className="relative h-40 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          {course.thumbnail?.url ? (
            <img
              src={course.thumbnail.url}
              alt={course.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <BookOpen className="h-10 w-10 text-slate-300 dark:text-slate-600" />
            </div>
          )}
          <div className="absolute left-2 top-2 flex gap-1.5">
            <span className={`badge ${levelColors[course.level]}`}>
              {course.level}
            </span>
            {course.isFree ? (
              <span className="badge bg-brand-100 text-brand-700 dark:bg-brand-950/30 dark:text-brand-400">
                Free
              </span>
            ) : (
              <span className="badge bg-slate-900/80 text-white">${course.price}</span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="line-clamp-2 font-semibold text-slate-900 group-hover:text-brand-600 dark:text-slate-100 dark:group-hover:text-brand-400">
            {course.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
            {course.shortDescription || course.description}
          </p>

          {/* Instructor */}
          {instructor && (
            <div className="mt-3 flex items-center gap-2">
              {instructor.avatar?.url ? (
                <img src={instructor.avatar.url} alt={instructor.name} className="h-6 w-6 rounded-full" />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-[10px] font-semibold text-brand-600 dark:bg-brand-900/40 dark:text-brand-400">
                  {instructor.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-xs text-slate-500 dark:text-slate-400">{instructor.name}</span>
            </div>
          )}

          {/* Stats */}
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {course.rating || 0}
              </span>
              <span className="text-xs text-slate-400">({course.numReviews})</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Users size={14} />
              {course.numStudents}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
