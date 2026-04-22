"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

type AdminTab = "pending" | "history" | "modules" | "accounts";

interface AdminDashboardTabsProps {
  pending: Module[];
  history: Module[];
  modules: Module[];
  users: ManageUser[];
  currentAdminId: string;
  activeTab: AdminTab;
  query: string;
  pendingPage: number;
  pendingTotalPages: number;
  pendingTotalCount: number;
  historyPage: number;
  historyTotalPages: number;
  historyTotalCount: number;
  modulesPage: number;
  modulesTotalPages: number;
  modulesTotalCount: number;
  accountsPage: number;
  accountsTotalPages: number;
  accountsTotalCount: number;
}

function buildHref({
  tab,
  pendingPage,
  historyPage,
  modulesPage,
  accountsPage,
  q,
}: {
  tab: AdminTab;
  pendingPage: number;
  historyPage: number;
  modulesPage: number;
  accountsPage: number;
  q?: string;
}) {
  const params = new URLSearchParams();
  params.set("tab", tab);
  params.set("pendingPage", String(pendingPage));
  params.set("historyPage", String(historyPage));
  params.set("modulesPage", String(modulesPage));
  params.set("accountsPage", String(accountsPage));
  if (q?.trim()) params.set("q", q.trim());
  return `/admin?${params.toString()}`;
}

export function AdminDashboardTabs({
  pending,
  history,
  modules,
  users,
  currentAdminId,
  activeTab,
  query,
  pendingPage,
  pendingTotalPages,
  pendingTotalCount,
  historyPage,
  historyTotalPages,
  historyTotalCount,
  modulesPage,
  modulesTotalPages,
  modulesTotalCount,
  accountsPage,
  accountsTotalPages,
  accountsTotalCount,
}: AdminDashboardTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [feedback, setFeedback] = useState("");
  const [reviewDecision, setReviewDecision] = useState<
    "APPROVED" | "REJECTED" | null
  >(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchValue, setSearchValue] = useState(query);
  const [confirmDeleteModuleId, setConfirmDeleteModuleId] = useState<
    string | null
  >(null);
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);

  useEffect(() => {
    setSearchValue(query);
  }, [query]);

  const currentList = useMemo(() => {
    if (activeTab === "pending") return pending;
    if (activeTab === "history") return history;
    if (activeTab === "modules") return modules;
    return users;
  }, [activeTab, pending, history, modules, users]);

  const currentPage =
    activeTab === "pending"
      ? pendingPage
      : activeTab === "history"
        ? historyPage
        : activeTab === "modules"
          ? modulesPage
          : accountsPage;

  const currentTotalPages =
    activeTab === "pending"
      ? pendingTotalPages
      : activeTab === "history"
        ? historyTotalPages
        : activeTab === "modules"
          ? modulesTotalPages
          : accountsTotalPages;

  const emptyMessage =
    activeTab === "pending"
      ? "No pending submissions."
      : activeTab === "history"
        ? "No review history yet."
        : activeTab === "modules"
          ? "No modules found."
          : "No accounts found.";

  const searchPlaceholder =
    activeTab === "accounts"
      ? "Search account by name/email"
      : "Search module by name";

  const currentCount =
    activeTab === "pending"
      ? pendingTotalCount
      : activeTab === "history"
        ? historyTotalCount
        : activeTab === "modules"
          ? modulesTotalCount
          : accountsTotalCount;

  const currentPath = pathname ?? "/admin";
  const currentRoute = searchParams?.toString()
    ? `${currentPath}?${searchParams.toString()}`
    : currentPath;

  const isPendingReview = useMemo(
    () => selectedModule?.status === "PENDING",
    [selectedModule],
  );

  function openReview(module: Module) {
    setSelectedModule(module);
    setFeedback("");
    setReviewDecision(null);
    setReviewError(null);
  }

  function closeReview() {
    setSelectedModule(null);
    setFeedback("");
    setReviewDecision(null);
    setReviewError(null);
  }

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

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextHref = buildHref({
      tab: activeTab,
      pendingPage: activeTab === "pending" ? 1 : pendingPage,
      historyPage: activeTab === "history" ? 1 : historyPage,
      modulesPage: activeTab === "modules" ? 1 : modulesPage,
      accountsPage: activeTab === "accounts" ? 1 : accountsPage,
      q: searchValue,
    });
    router.push(nextHref, { scroll: false });
  }

  function tabHref(tab: AdminTab) {
    return buildHref({
      tab,
      pendingPage,
      historyPage,
      modulesPage,
      accountsPage,
      q: searchValue,
    });
  }

  async function handleReview(status: "APPROVED" | "REJECTED") {
    if (!selectedModule) return;

    if (status === "REJECTED" && !feedback.trim()) {
      setReviewError("Feedback is required when rejecting a module");
      return;
    }

    setIsSubmitting(true);
    setReviewError(null);
    try {
      await fetch(`/api/modules/${selectedModule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          feedback: status === "REJECTED" ? feedback : undefined,
        }),
      });
      closeReview();
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-indigo-300/15 bg-slate-900/70 p-6 sm:p-8">
      <div className="flex w-full flex-wrap gap-2 p-1">
        <Link
          href={tabHref("pending")}
          scroll={false}
          className={cn(
            "rounded-lg border border-indigo-300/15 px-4 py-2 text-sm font-semibold transition",
            activeTab === "pending"
              ? "bg-violet-500/30 text-violet-100"
              : "text-slate-400 hover:text-slate-200",
          )}
        >
          Pending ({pendingTotalCount})
        </Link>
        <Link
          href={tabHref("history")}
          scroll={false}
          className={cn(
            "rounded-lg border border-indigo-300/15 px-4 py-2 text-sm font-semibold transition",
            activeTab === "history"
              ? "bg-violet-500/30 text-violet-100"
              : "text-slate-400 hover:text-slate-200",
          )}
        >
          History ({historyTotalCount})
        </Link>
        <Link
          href={tabHref("modules")}
          scroll={false}
          className={cn(
            "rounded-lg border border-indigo-300/15 px-4 py-2 text-sm font-semibold transition",
            activeTab === "modules"
              ? "bg-violet-500/30 text-violet-100"
              : "text-slate-400 hover:text-slate-200",
          )}
        >
          Modules ({modulesTotalCount})
        </Link>
        <Link
          href={tabHref("accounts")}
          scroll={false}
          className={cn(
            "rounded-lg border border-indigo-300/15 px-4 py-2 text-sm font-semibold transition",
            activeTab === "accounts"
              ? "bg-violet-500/30 text-violet-100"
              : "text-slate-400 hover:text-slate-200",
          )}
        >
          Accounts ({accountsTotalCount})
        </Link>
      </div>

      <form
        onSubmit={submitSearch}
        className="flex w-full flex-wrap items-center gap-2"
      >
        <input
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder={searchPlaceholder}
          className="w-full max-w-xs rounded-lg border border-indigo-300/20 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-violet-400/65"
        />
        <button
          type="submit"
          className="rounded-lg border border-indigo-300/25 bg-slate-950/70 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-violet-300/35 hover:text-violet-200"
        >
          Search
        </button>
        {query ? (
          <Link
            href={buildHref({
              tab: activeTab,
              pendingPage: activeTab === "pending" ? 1 : pendingPage,
              historyPage: activeTab === "history" ? 1 : historyPage,
              modulesPage: activeTab === "modules" ? 1 : modulesPage,
              accountsPage: activeTab === "accounts" ? 1 : accountsPage,
              q: "",
            })}
            scroll={false}
            className="rounded-lg border border-indigo-300/20 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:text-slate-100"
          >
            Clear
          </Link>
        ) : null}
      </form>

      <p className="text-xs text-slate-500">{currentCount} results</p>

      {currentList.length === 0 ? (
        <p className="rounded-xl border border-indigo-300/15 bg-slate-900/70 px-4 py-3 text-sm text-slate-400">
          {emptyMessage}
        </p>
      ) : (
        <div className="space-y-3">
          {activeTab === "accounts"
            ? (currentList as ManageUser[]).map((user) => {
                const isSelf = user.id === currentAdminId;
                return (
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
                        {isSelf ? " · You" : ""}
                      </p>
                    </div>

                    {isSelf ? (
                      <span className="rounded-full border border-indigo-300/20 bg-slate-950/70 px-3 py-1 text-xs font-semibold text-slate-300">
                        Current account
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={loadingActionId === user.id}
                        onClick={() => toggleUserLock(user.id, !user.isLocked)}
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-semibold transition disabled:opacity-60",
                          user.isLocked
                            ? "border border-emerald-400/35 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25"
                            : "border border-amber-400/35 bg-amber-500/15 text-amber-200 hover:bg-amber-500/25",
                        )}
                      >
                        {user.isLocked ? "Unlock" : "Lock"}
                      </button>
                    )}
                  </div>
                );
              })
            : (currentList as Module[]).map((module) => (
                <div
                  key={module.id}
                  className="flex items-center justify-between rounded-xl border border-indigo-300/15 bg-slate-900/70 p-4 shadow-[0_10px_28px_rgba(11,14,30,0.3)]"
                >
                  <div className="min-w-0 space-y-1">
                    <Link
                      href={`/modules/${module.slug}?from=${encodeURIComponent(currentRoute)}`}
                      className="block truncate font-semibold text-slate-50 transition hover:text-violet-200 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
                    >
                      {module.name}
                    </Link>
                    <p className="text-xs text-slate-400">
                      {module.category.name} · by{" "}
                      {module.author.name || "Anonymous"}
                    </p>
                  </div>

                  {activeTab === "pending" ? (
                    <button
                      type="button"
                      onClick={() => openReview(module)}
                      className="shrink-0 rounded-full border border-indigo-300/25 bg-slate-950/80 px-3 py-1 text-xs font-semibold text-violet-200 transition hover:border-violet-300/35 hover:text-violet-100"
                    >
                      Review
                    </button>
                  ) : activeTab === "history" ? (
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
                        module.status === "APPROVED"
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-400/30"
                          : "bg-rose-500/15 text-rose-300 border border-rose-400/30",
                      )}
                    >
                      {module.status}
                    </span>
                  ) : (
                    <div className="ml-3 flex items-center gap-2">
                      <button
                        type="button"
                        disabled={loadingActionId === module.id}
                        onClick={() =>
                          toggleModuleLock(module.id, !module.isLocked)
                        }
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-semibold transition disabled:opacity-60",
                          module.isLocked
                            ? "border border-emerald-400/35 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25"
                            : "border border-amber-400/35 bg-amber-500/15 text-amber-200 hover:bg-amber-500/25",
                        )}
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
                  )}
                </div>
              ))}
        </div>
      )}

      <PaginationRow
        currentPage={currentPage}
        totalPages={currentTotalPages}
        buildPageHref={(nextPage) =>
          buildHref({
            tab: activeTab,
            pendingPage: activeTab === "pending" ? nextPage : pendingPage,
            historyPage: activeTab === "history" ? nextPage : historyPage,
            modulesPage: activeTab === "modules" ? nextPage : modulesPage,
            accountsPage: activeTab === "accounts" ? nextPage : accountsPage,
            q: searchValue,
          })
        }
      />

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

      {selectedModule && (
        <div
          className="flex items-center justify-center fixed inset-0 z-100 bg-slate-950/75 p-4 backdrop-blur-sm"
          onClick={closeReview}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-indigo-300/15 bg-slate-900 p-6 shadow-[0_24px_60px_rgba(5,8,20,0.6)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                  Module Review
                </p>
                <h3 className="mt-1 break-all text-xl font-bold text-slate-100">
                  {selectedModule.name}
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  {selectedModule.category.name} · by{" "}
                  {selectedModule.author.name || "Anonymous"}
                </p>
              </div>
              <button
                type="button"
                onClick={closeReview}
                className="rounded-md border border-indigo-300/20 px-3 py-1 text-xs font-semibold text-slate-300 transition hover:text-slate-100"
              >
                Close
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                  Description
                </p>
                <p className="whitespace-pre-wrap break-all rounded-xl border border-indigo-300/15 bg-slate-950/70 p-4 text-sm leading-6 text-slate-200">
                  {selectedModule.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <a
                  href={selectedModule.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-indigo-300/20 px-3 py-1.5 font-semibold text-violet-200 transition hover:text-violet-100"
                >
                  GitHub
                </a>
                {selectedModule.demoUrl && (
                  <a
                    href={selectedModule.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-indigo-300/20 px-3 py-1.5 font-semibold text-violet-200 transition hover:text-violet-100"
                  >
                    Demo
                  </a>
                )}
              </div>

              {isPendingReview ? (
                <>
                  {reviewDecision === "REJECTED" ? (
                    <>
                      <div>
                        <label
                          htmlFor="admin-review-feedback"
                          className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-400"
                        >
                          Feedback for contributor
                        </label>
                        <textarea
                          id="admin-review-feedback"
                          value={feedback}
                          onChange={(e) => {
                            setFeedback(e.target.value);
                            if (reviewError) setReviewError(null);
                          }}
                          rows={4}
                          maxLength={500}
                          placeholder="Write actionable feedback for the contributor..."
                          className="w-full rounded-xl border border-indigo-300/20 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-violet-400/65 focus:ring-2 focus:ring-violet-400/25"
                        />
                        {reviewError ? (
                          <p className="mt-2 text-xs text-rose-300">
                            {reviewError}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setReviewDecision(null);
                            setReviewError(null);
                            setFeedback("");
                          }}
                          disabled={isSubmitting}
                          className="flex-1 rounded-lg border border-indigo-300/20 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReview("REJECTED")}
                          disabled={isSubmitting}
                          className="flex-1 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Confirm reject
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleReview("APPROVED")}
                        disabled={isSubmitting}
                        className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => setReviewDecision("REJECTED")}
                        disabled={isSubmitting}
                        className="flex-1 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-2 rounded-xl border border-indigo-300/15 bg-slate-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.08em] text-slate-400">
                    Review Result
                  </p>
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      selectedModule.status === "APPROVED"
                        ? "text-emerald-300"
                        : "text-rose-300",
                    )}
                  >
                    {selectedModule.status}
                  </p>
                  <p className="text-sm text-slate-300">
                    {selectedModule.feedback?.trim()
                      ? selectedModule.feedback
                      : "No feedback was added for this review."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function PaginationRow({
  currentPage,
  totalPages,
  buildPageHref,
}: {
  currentPage: number;
  totalPages: number;
  buildPageHref: (nextPage: number) => string;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-between gap-3 border-t border-indigo-300/10 pt-4">
      <Link
        href={buildPageHref(Math.max(1, currentPage - 1))}
        scroll={false}
        aria-disabled={currentPage === 1}
        className={cn(
          "rounded-lg border border-indigo-300/20 px-3 py-1.5 text-xs font-semibold transition",
          currentPage === 1
            ? "pointer-events-none opacity-40"
            : "text-slate-200 hover:border-violet-300/35 hover:text-violet-200",
        )}
      >
        {"<"}
      </Link>

      <p className="text-xs text-slate-400">
        Page {currentPage} / {totalPages}
      </p>

      <Link
        href={buildPageHref(Math.min(totalPages, currentPage + 1))}
        scroll={false}
        aria-disabled={currentPage === totalPages}
        className={cn(
          "rounded-lg border border-indigo-300/20 px-3 py-1.5 text-xs font-semibold transition",
          currentPage === totalPages
            ? "pointer-events-none opacity-40"
            : "text-slate-200 hover:border-violet-300/35 hover:text-violet-200",
        )}
      >
        {">"}
      </Link>
    </div>
  );
}
