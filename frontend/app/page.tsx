"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Sparkles,
  Bot,
  Brain,
  FileText,
  Layers,
  BarChart3,
  Users,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Menu,
  X,
  Moon,
  Sun,
  BookOpen,
  Star,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";

export default function LandingPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  const features = [
    { icon: Bot, title: "AI Learning Assistant", desc: "Ask questions, get explanations, and receive personalized learning guidance powered by AI." },
    { icon: Brain, title: "AI Quiz Generator", desc: "Generate quizzes on any topic with customizable difficulty and question count." },
    { icon: FileText, title: "AI Notes & Summarization", desc: "Summarize long content, extract key points, and create revision notes instantly." },
    { icon: Layers, title: "AI Flashcards", desc: "Generate flashcards from any topic and study with interactive flip-card practice." },
    { icon: BarChart3, title: "Learning Analytics", desc: "Track your progress, study streaks, and performance with detailed insights." },
    { icon: ShieldCheck, title: "Secure & Reliable", desc: "JWT authentication, role-based access, and secure file handling built-in." },
  ];

  const stats = [
    { value: "10+", label: "Categories" },
    { value: "3", label: "User Roles" },
    { value: "AI", label: "Powered Learning" },
    { value: "24/7", label: "Access Anywhere" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Learnova<span className="text-brand-600">AI</span>
            </span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            <Link href="/courses" className="text-sm font-medium text-slate-600 hover:text-brand-600 dark:text-slate-300">Courses</Link>
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-brand-600 dark:text-slate-300">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-brand-600 dark:text-slate-300">How it Works</a>
          </div>

          <div className="flex items-center gap-2">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}
            {user ? (
              <Link href={`/${user.role}`} className="btn-primary text-xs sm:text-sm">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn-ghost hidden sm:inline-flex text-sm">
                  Log in
                </Link>
                <Link href="/register" className="btn-primary text-xs sm:text-sm">
                  Get Started
                </Link>
              </>
            )}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-slate-200 px-4 py-4 md:hidden dark:border-slate-800">
            <Link href="/courses" onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-slate-600 dark:text-slate-300">Courses</Link>
            <a href="#features" onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-slate-600 dark:text-slate-300">Features</a>
            <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-slate-600 dark:text-slate-300">How it Works</a>
            <div className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-700">
              {user ? (
                <Link href={`/${user.role}`} onClick={() => setMenuOpen(false)} className="block w-full btn-primary text-center text-sm">
                  Dashboard
                </Link>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="block w-full btn-ghost text-center text-sm">
                    Log in
                  </Link>
                  <Link href="/register" onClick={() => setMenuOpen(false)} className="block w-full btn-primary text-center text-sm">
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-purple-50 dark:from-brand-950/20 dark:via-slate-950 dark:to-purple-950/20" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 dark:border-brand-800 dark:bg-brand-950/40 dark:text-brand-400">
              <Sparkles size={14} /> AI-Powered Learning Platform
            </div>
            <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-slate-50">
              Learn smarter with{" "}
              <span className="bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">
                AI-powered education
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
              Learnova AI transforms how you learn. Get instant explanations, generate quizzes and
              flashcards, summarize content, and track your progress — all in one modern platform.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {user ? (
                <Link href={`/${user.role}`} className="btn-primary text-base">
                  Go to Dashboard <ArrowRight size={18} />
                </Link>
              ) : (
                <>
                  <Link href="/register" className="btn-primary text-base">
                    Start Learning Free <ArrowRight size={18} />
                  </Link>
                  <Link href="/courses" className="btn-secondary text-base">
                    Browse Courses
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold text-brand-600 dark:text-brand-400">{s.value}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Everything you need to learn
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">
              A complete learning ecosystem powered by artificial intelligence
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="card p-6 transition-all hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-950/40">
                  <f.icon className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-slate-50 py-20 dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">How it works</h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">Three simple steps to start learning smarter</p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { step: "01", title: "Create your account", desc: "Sign up as a student or instructor in seconds and join the learning community." },
              { step: "02", title: "Enroll in courses", desc: "Browse courses across multiple categories and enroll in the ones that interest you." },
              { step: "03", title: "Learn with AI", desc: "Use AI tools to study smarter — ask questions, generate quizzes, summarize content, and track progress." },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="mb-4 text-4xl font-bold text-brand-200 dark:text-brand-900">{item.step}</div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Built for everyone</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { icon: BookOpen, role: "For Students", points: ["AI-powered study assistant", "Smart quiz generation", "Flashcard creation", "Progress tracking"] },
              { icon: Users, role: "For Instructors", points: ["Create and manage courses", "Upload video content", "Grade assignments", "Track student progress"] },
              { icon: ShieldCheck, role: "For Admins", points: ["Manage all users", "Approve courses", "Monitor platform activity", "Full analytics dashboard"] },
            ].map((r) => (
              <div key={r.role} className="card p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-950/40">
                  <r.icon className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{r.role}</h3>
                <ul className="mt-4 space-y-2">
                  {r.points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-r from-brand-600 to-purple-600 px-6 py-16 text-center">
            <h2 className="text-3xl font-bold text-white">Ready to start learning?</h2>
            <p className="mx-auto mt-3 max-w-xl text-brand-100">
              Join Learnova AI today and experience the future of education with AI-powered tools.
            </p>
            {user ? (
              <Link href={`/${user.role}`} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-600 transition-all hover:bg-brand-50">
                Go to Dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <Link href="/register" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-600 transition-all hover:bg-brand-50">
                Get Started Free <ArrowRight size={18} />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-slate-900 dark:text-slate-100">Learnova AI</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} Learnova AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
