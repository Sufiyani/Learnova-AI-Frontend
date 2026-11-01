"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  ClipboardList,
  BarChart3,
  Bot,
  FileText,
  Layers,
  Brain,
  Users,
  Settings,
  FolderPlus,
  ShieldCheck,
  FolderTree,
  Sparkles,
  ChevronLeft,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const studentNav: NavItem[] = [
  { label: "Dashboard", href: "/student", icon: LayoutDashboard },
  { label: "Browse Courses", href: "/courses", icon: BookOpen },
  { label: "My Courses", href: "/student/my-courses", icon: GraduationCap },
  { label: "AI Assistant", href: "/student/ai-assistant", icon: Bot },
  { label: "AI Quiz Generator", href: "/student/ai-quizzes", icon: Brain },
  { label: "AI Notes", href: "/student/ai-notes", icon: FileText },
  { label: "AI Flashcards", href: "/student/ai-flashcards", icon: Layers },
  { label: "Assignments", href: "/student/assignments", icon: ClipboardList },
  { label: "Analytics", href: "/student/analytics", icon: BarChart3 },
  { label: "Settings", href: "/student/settings", icon: Settings },
];

const instructorNav: NavItem[] = [
  { label: "Dashboard", href: "/instructor", icon: LayoutDashboard },
  { label: "My Courses", href: "/instructor/courses", icon: BookOpen },
  { label: "Create Course", href: "/instructor/courses/create", icon: FolderPlus },
  { label: "Assignments", href: "/instructor/assignments", icon: ClipboardList },
  { label: "Quiz Manager", href: "/instructor/quizzes", icon: Brain },
  { label: "Students", href: "/instructor/students", icon: Users },
  { label: "Settings", href: "/instructor/settings", icon: Settings },
];

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Courses", href: "/admin/courses", icon: BookOpen },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function Sidebar({ role, collapsed, setCollapsed }: { role: string; collapsed: boolean; setCollapsed: (v: boolean) => void }) {
  const pathname = usePathname();
  const navItems = role === "admin" ? adminNav : role === "instructor" ? instructorNav : studentNav;

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-64"
      } shrink-0 flex flex-col border-r border-slate-200 bg-white transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-0 lg:h-screen`}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-4 dark:border-slate-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Learnova<span className="text-brand-600">AI</span>
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== `/${role}` && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-400"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="hidden border-t border-slate-200 p-2 dark:border-slate-800 lg:block">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <ChevronLeft size={18} className={`transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </div>
    </aside>
  );
}
