"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

export function Navbar() {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    async function loadUnreadCount() {
      const response = await fetch("/api/notifications/unread-count", {
        cache: "no-store",
      });

      if (!response.ok || cancelled) return;

      const data = (await response.json()) as { count?: number };
      setUnreadCount(data.count ?? 0);
    }

    void loadUnreadCount();

    const refreshUnreadCount = () => {
      void loadUnreadCount();
    };

    window.addEventListener("focus", refreshUnreadCount);
    window.addEventListener("notifications-updated", refreshUnreadCount);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", refreshUnreadCount);
      window.removeEventListener("notifications-updated", refreshUnreadCount);
    };
  }, [userId]);

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-base font-bold text-gray-900">
          Intern Community Hub
        </Link>

        <div className="flex items-center gap-4">
          {session ? (
            <>
              <Link href="/submit" className="text-sm text-gray-600 hover:text-gray-900">
                Submit Module
              </Link>
              <Link href="/notifications" className="text-sm text-gray-600 hover:text-gray-900">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
              <Link href="/my-submissions" className="text-sm text-gray-600 hover:text-gray-900">
                My Submissions
              </Link>
              {session.user.isAdmin && (
                <Link href="/admin" className="text-sm font-medium text-orange-600 hover:text-orange-700">
                  Admin
                </Link>
              )}
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                Sign out
              </button>
              <span className="text-sm text-gray-700">{session.user.name}</span>
            </>
          ) : (
            <button
              onClick={() => signIn("github")}
              className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700"
            >
              Sign in with GitHub
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
