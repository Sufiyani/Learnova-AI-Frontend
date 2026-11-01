"use client";

import { useEffect, useState } from "react";
import { Search, ShieldBan, ShieldCheck, Loader2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { adminApi, getErrorMessage } from "@/services/api";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import type { User } from "@/types";
import toast from "react-hot-toast";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionTarget, setActionTarget] = useState<{ user: User; action: "block" | "unblock" | "delete" } | null>(null);
  const [actioning, setActioning] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | boolean> = { page, limit: 20 };
      if (search) params.q = search;
      if (roleFilter) params.role = roleFilter;
      const res = await adminApi.getUsers(params);
      setUsers(res.data.data || []);
      setTotalPages(res.data.pagination?.pages || 1);
      setTotal(res.data.pagination?.total || 0);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleAction = async () => {
    if (!actionTarget) return;
    setActioning(true);
    try {
      const { user, action } = actionTarget;
      if (action === "block") await adminApi.blockUser(user._id);
      else if (action === "unblock") await adminApi.unblockUser(user._id);
      else if (action === "delete") await adminApi.deleteUser(user._id);
      toast.success(`User ${action}ed successfully`);
      setActionTarget(null);
      fetchUsers();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActioning(false);
    }
  };

  const roleColors: Record<string, string> = {
    student: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
    instructor: "bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400",
    admin: "bg-brand-100 text-brand-700 dark:bg-brand-950/30 dark:text-brand-400",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">User Management</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{total} total users</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="input-field pl-9"
          />
        </form>
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} className="input-field max-w-xs">
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="instructor">Instructors</option>
        </select>
      </div>

      {/* Users table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-brand-500" />
        </div>
      ) : users.length === 0 ? (
        <EmptyState icon={Search} title="No users found" description="Try adjusting your search or filters." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-slate-50 last:border-0 dark:border-slate-800/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {user.avatar?.url ? (
                          <img src={user.avatar.url} alt={user.name} className="h-8 w-8 rounded-full" />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-600 dark:bg-brand-900/40 dark:text-brand-400">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">{user.name}</p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${roleColors[user.role] || roleColors.student}`}>{user.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      {user.isBlocked ? (
                        <span className="badge bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400">Blocked</span>
                      ) : (
                        <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">Active</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        {user.role !== "admin" && (
                          <>
                            {user.isBlocked ? (
                              <button
                                onClick={() => setActionTarget({ user, action: "unblock" })}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                title="Unblock"
                              >
                                <ShieldCheck size={16} />
                              </button>
                            ) : (
                              <button
                                onClick={() => setActionTarget({ user, action: "block" })}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                                title="Block"
                              >
                                <ShieldBan size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => setActionTarget({ user, action: "delete" })}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 dark:border-slate-800">
              <p className="text-xs text-slate-400">Page {page} of {totalPages}</p>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-ghost disabled:opacity-50"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn-ghost disabled:opacity-50"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!actionTarget}
        title={actionTarget?.action === "block" ? "Block user?" : actionTarget?.action === "unblock" ? "Unblock user?" : "Delete user?"}
        message={
          actionTarget?.action === "block"
            ? `${actionTarget.user.name} will be blocked and unable to access the platform.`
            : actionTarget?.action === "unblock"
            ? `${actionTarget.user.name} will be unblocked and regain access.`
            : `This will permanently delete ${actionTarget?.user.name}'s account. This cannot be undone.`
        }
        danger={actionTarget?.action === "delete" || actionTarget?.action === "block"}
        confirmText={actionTarget?.action === "block" ? "Block" : actionTarget?.action === "unblock" ? "Unblock" : "Delete"}
        loading={actioning}
        onConfirm={handleAction}
        onCancel={() => setActionTarget(null)}
      />
    </div>
  );
}
