"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Module } from "@/types";

type ManageUser = {
  id: string;
  name: string | null;
  email: string | null;
  isAdmin: boolean;
  isLocked: boolean;
};

interface AdminManagementPanelProps {
  modules: Module[];
  users: ManageUser[];
}

export function AdminManagementPanel({
  modules,
  users,
}: AdminManagementPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"modules" | "accounts">("modules");
  const [query, setQuery] = useState("");
  const [confirmDeleteModuleId, setConfirmDeleteModuleId] = useState<
    string | null
  >(null);
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);

  const currentPath = pathname ?? "/admin";
  const currentRoute = searchParams?.toString()
    ? `${currentPath}?${searchParams.toString()}`
    : currentPath;

  const filteredModules = useMemo(() => {
    const key = query.trim().toLowerCase();
    if (!key) return modules;
    return modules.filter((module) => module.name.toLowerCase().includes(key));
  }, [modules, query]);

  const filteredUsers = useMemo(() => {
    const key = query.trim().toLowerCase();
    if (!key) return users;
    return users.filter((user) => {
      const name = user.name?.toLowerCase() ?? "";
      const email = user.email?.toLowerCase() ?? "";
      return name.includes(key) || email.includes(key);
    });
  }, [users, query]);

  async function toggleModuleLock(moduleId: string, isLocked: boolean) {
    setLoadingActionId(moduleId);
    try {
      await fetch(`/api/admin/modules/${moduleId}/lock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLocked }),
      });
      router.refresh();
    } finally {
      setLoadingActionId(null);
    }
  }

  async function deleteModule(moduleId: string) {
    setLoadingActionId(moduleId);
    try {
      await fetch(`/api/modules/${moduleId}`, { method: "DELETE" });
      setConfirmDeleteModuleId(null);
      router.refresh();
    } finally {
      setLoadingActionId(null);
    }
  }

  async function toggleUserLock(userId: string, isLocked: boolean) {
    setLoadingActionId(userId);
    try {
      await fetch(`/api/admin/users/${userId}/lock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLocked }),
      });
      router.refresh();
    } finally {
      setLoadingActionId(null);
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-indigo-300/15 bg-slate-900/70 p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("modules")}
            className={cn(
              "rounded-lg border border-indigo-300/15 px-4 py-2 text-sm font-semibold transition",
              activeTab === "modules"
                ? "bg-violet-500/30 text-violet-100"
                : "text-slate-400 hover:text-slate-200",
            )}
          >
            Modules
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("accounts")}
            className={cn(
              "rounded-lg border border-indigo-300/15 px-4 py-2 text-sm font-semibold transition",
              activeTab === "accounts"
                ? "bg-violet-500/30 text-violet-100"
                : "text-slate-400 hover:text-slate-200",
            )}
          >
            Accounts
          </button>
        </div>

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={
            activeTab === "modules"
              ? "Search module by name"
              : "Search account by name/email"
          }
          className="w-full max-w-xs rounded-lg border border-indigo-300/20 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-violet-400/65"
        />
      </div>

      {activeTab === "modules" ? (
        <div className="space-y-3">
          {filteredModules.length === 0 ? (
            <p className="rounded-xl border border-indigo-300/15 bg-slate-900/70 px-4 py-3 text-sm text-slate-400">
              No modules found.
            </p>
          ) : (
            filteredModules.map((module) => (
              <div
                key={module.id}
                className="flex items-center justify-between rounded-xl border border-indigo-300/15 bg-slate-900/70 p-4 shadow-[0_10px_28px_rgba(11,14,30,0.3)]"
              >
                <div className="min-w-0 space-y-1">
                  <Link
                    href={`/modules/${module.slug}?from=${encodeURIComponent(currentRoute)}`}
                    className="block truncate font-semibold text-slate-50 transition hover:text-violet-200 hover:underline"
                  >
                    {module.name}
                  </Link>
                  <p className="text-xs text-slate-400">
                    {module.category.name} · by{" "}
                    {module.author.name || "Anonymous"}
                  </p>
                </div>

                <div className="ml-3 flex items-center gap-2">
                  <button
                    type="button"
                    disabled={loadingActionId === module.id}
                    onClick={() =>
                      toggleModuleLock(module.id, !module.isLocked)
                    }
                    className="rounded-full border border-indigo-300/25 bg-slate-950/80 px-3 py-1 text-xs font-semibold text-violet-200 transition hover:border-violet-300/35 disabled:opacity-60"
                  >
                    {module.isLocked ? "Unlock" : "Lock"}
                  </button>
                  <button
                    type="button"
                    disabled={loadingActionId === module.id}
                    onClick={() => setConfirmDeleteModuleId(module.id)}
                    className="rounded-full border border-rose-400/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20 disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.length === 0 ? (
            <p className="rounded-xl border border-indigo-300/15 bg-slate-900/70 px-4 py-3 text-sm text-slate-400">
              No accounts found.
            </p>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-xl border border-indigo-300/15 bg-slate-900/70 p-4 shadow-[0_10px_28px_rgba(11,14,30,0.3)]"
              >
                <div className="min-w-0 space-y-1">
                  <p className="truncate font-semibold text-slate-50">
                    {user.name || "Unnamed user"}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {user.email || "No email"}
                    {user.isAdmin ? " · Admin" : ""}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={loadingActionId === user.id}
                  onClick={() => toggleUserLock(user.id, !user.isLocked)}
                  className="rounded-full border border-indigo-300/25 bg-slate-950/80 px-3 py-1 text-xs font-semibold text-violet-200 transition hover:border-violet-300/35 disabled:opacity-60"
                >
                  {user.isLocked ? "Unlock" : "Lock"}
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {confirmDeleteModuleId && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm"
          onClick={() => setConfirmDeleteModuleId(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl border border-indigo-300/15 bg-slate-900 p-5 shadow-[0_24px_60px_rgba(5,8,20,0.6)]"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-slate-100">
              Delete module?
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              This will permanently remove the module and cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteModuleId(null)}
                className="rounded-lg border border-indigo-300/20 px-3 py-1.5 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteModule(confirmDeleteModuleId)}
                disabled={loadingActionId === confirmDeleteModuleId}
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
