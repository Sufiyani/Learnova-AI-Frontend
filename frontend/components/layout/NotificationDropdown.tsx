"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { notificationApi, getErrorMessage } from "@/services/api";
import type { Notification } from "@/types";
import toast from "react-hot-toast";

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchNotifications = async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        notificationApi.list({ limit: 10 }),
        notificationApi.getUnreadCount(),
      ]);
      setNotifications(listRes.data.data.data || []);
      setUnreadCount(countRes.data.data.count || 0);
    } catch (err) {
      // Silent fail for background polling
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleMarkRead = async (id: string, link?: string) => {
    try {
      const notif = notifications.find((n) => n._id === id);
      if (notif && !notif.isRead) {
        await notificationApi.markAsRead(id);
        setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
        setUnreadCount((c) => Math.max(0, c - 1));
      }
      setOpen(false);
      if (link) router.push(link);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 animate-slide-up overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-400">No notifications yet</div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n._id}
                  onClick={() => handleMarkRead(n._id, n.link)}
                  className={`flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50 ${
                    !n.isRead ? "bg-brand-50/50 dark:bg-brand-950/20" : ""
                  }`}
                >
                  <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${n.isRead ? "bg-transparent" : "bg-brand-500"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{n.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{n.message}</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">{formatTime(n.createdAt)}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
