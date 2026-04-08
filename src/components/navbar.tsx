"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadUnreadCount() {
      if (!session?.user) {
        setUnreadCount(0);
        return;
      }

      try {
        const res = await fetch("/api/notifications/unread-count", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) return;

        const data = (await res.json()) as { unreadCount: number };
        if (!cancelled) setUnreadCount(data.unreadCount ?? 0);
      } catch {
        if (!cancelled) setUnreadCount(0);
      }
    }

    void loadUnreadCount();

    function handleNotificationsUpdated() {
      void loadUnreadCount();
    }

    window.addEventListener(
      "notifications-updated",
      handleNotificationsUpdated,
    );

    return () => {
      cancelled = true;
      window.removeEventListener(
        "notifications-updated",
        handleNotificationsUpdated,
      );
    };
  }, [session?.user, pathname]);

  const navItemClass = (href: string) =>
    `text-sm ${
      pathname === href
        ? "font-medium text-gray-900"
        : "text-gray-600 hover:text-gray-900"
    }`;

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-base font-bold text-gray-900">
          Intern Community Hub
        </Link>

        <div className="flex items-center gap-4">
          {session ? (
            <>
              <Link href="/submit" className={navItemClass("/submit")}>
                Submit Module
              </Link>
              <Link
                href="/my-submissions"
                className={navItemClass("/my-submissions")}
              >
                My Submissions
              </Link>
              <Link
                href="/notifications"
                className={`${navItemClass("/notifications")} inline-flex items-center gap-1.5`}
              >
                Notifications
                {unreadCount > 0 && (
                  <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                    {unreadCount}
                  </span>
                )}
              </Link>
              {session.user.isAdmin && (
                <Link
                  href="/admin"
                  className={`text-sm ${pathname === "/admin" ? "font-semibold text-orange-700" : "font-medium text-orange-600 hover:text-orange-700"}`}
                >
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
