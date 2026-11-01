"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import ThemeToggle from "@/components/layout/ThemeToggle";

export default function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Left brand panel */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 to-purple-600 p-12 flex-col justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Learnova AI</span>
          </Link>

          <div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Learn smarter with AI-powered education
            </h1>
            <p className="mt-4 text-brand-100 text-lg">
              Join thousands of students and instructors using AI to transform how they learn and teach.
            </p>
            <ul className="mt-8 space-y-3">
              {["AI learning assistant", "Smart quiz generation", "Flashcard creation", "Progress analytics"].map((item) => (
                <li key={item} className="flex items-center gap-3 text-white">
                  <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-xs">✓</span>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-brand-100 text-sm">© {new Date().getFullYear()} Learnova AI</p>
        </div>

        {/* Right form panel */}
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="mb-6 flex items-center justify-between lg:hidden">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-slate-900 dark:text-slate-100">Learnova AI</span>
              </Link>
              <ThemeToggle />
            </div>

            <div className="mb-8 hidden lg:block lg:justify-end lg:flex">
              <ThemeToggle />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</h2>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>

            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
