"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/hooks/use-notifications";
import { formatRelativeTime } from "@/lib/utils";

const PAGE_SIZE = 10;

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { notifications, unreadCount, isLoading, fetchAll, markRead, markAllRead } =
    useNotifications();

  // Client-side pagination — no URL params needed since this list is already
  // client-fetched and we cap at 50 items total from the API.
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchAll();
    }
  }, [status, fetchAll]);

  
  // Thêm một state để lưu trữ độ dài của danh sách trước đó
  const [prevNotifLength, setPrevNotifLength] = useState(notifications.length);

  // So sánh trực tiếp trong lúc render
  if (notifications.length !== prevNotifLength) {
    setPrevNotifLength(notifications.length);
    setPage(1); // Đặt lại trang 1
  }

  if (status === "loading" || status === "unauthenticated") {
    return null;
  }

  const totalPages = Math.max(1, Math.ceil(notifications.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = notifications.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {notifications.length > 0 && (
            <p className="mt-0.5 text-sm text-gray-400">
              {notifications.length} total · {unreadCount} unread
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => { markAllRead(); setPage(1); }}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Mark all read ({unreadCount})
          </button>
        )}
      </div>

      {/* ── List ──────────────────────────────────────────────────────── */}
      {isLoading && notifications.length === 0 ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No notifications yet.</p>
          <p className="mt-1 text-sm text-gray-400">
            You&apos;ll be notified here when a submission is approved or rejected.
          </p>
        </div>
      ) : (
        <>
          <ul className="space-y-2">
            {paged.map((n) => (
              <li
                key={n.id}
                className={`flex items-start gap-4 rounded-xl border px-5 py-4 transition-colors ${
                  n.read
                    ? "border-gray-200 bg-white"
                    : "border-blue-100 bg-blue-50/50"
                }`}
              >
                {/* Status dot */}
                <span
                  className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                    n.type === "SUBMISSION_APPROVED" ? "bg-green-500" : "bg-red-400"
                  }`}
                  aria-hidden="true"
                />

                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-gray-900">{n.message}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <time dateTime={new Date(n.createdAt).toISOString()}>
                      {formatRelativeTime(new Date(n.createdAt))}
                    </time>
                    {n.miniApp?.slug && (
                      <Link
                        href={`/modules/${n.miniApp.slug}`}
                        className="text-blue-600 hover:underline"
                      >
                        View module →
                      </Link>
                    )}
                  </div>
                </div>

                {!n.read && (
                  <button
                    onClick={() => markRead(n.id)}
                    aria-label={`Mark as read`}
                    className="shrink-0 rounded-md px-2 py-1 text-xs text-gray-400 hover:bg-white hover:text-blue-600"
                  >
                    Mark read
                  </button>
                )}
              </li>
            ))}
          </ul>

          {/* ── Pagination ──────────────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-400">
                Page {safePage} of {totalPages} · showing {paged.length} of{" "}
                {notifications.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← Prev
                </button>

                {/* Page numbers */}
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === totalPages ||
                        Math.abs(p - safePage) <= 1
                    )
                    .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                      if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1)
                        acc.push("…");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === "…" ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="px-1 text-xs text-gray-400"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => setPage(item as number)}
                          className={`rounded-md border px-2.5 py-1 text-xs font-medium ${
                            item === safePage
                              ? "border-blue-500 bg-blue-600 text-white"
                              : "border-gray-300 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}