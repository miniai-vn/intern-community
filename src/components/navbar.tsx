"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useUnreadCount } from "@/hooks/use-notifications";

export function Navbar() {
  const { data: session } = useSession();
  const { count: unreadCount } = useUnreadCount();

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-base font-bold text-gray-900">
          Intern Community Hub
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/leaderboard"
            className="group flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-1 text-sm font-medium text-gray-600 transition-all hover:border-yellow-400 hover:bg-yellow-50 hover:text-yellow-700 hover:shadow-sm"
          >
            <span className="transition-transform group-hover:rotate-12">🏆</span>
            <span className="hidden sm:inline">Leaderboard</span>
          </Link>
          {session ? (
            <>
              <Link href="/submit" className="text-sm text-gray-600 hover:text-gray-900">
                Submit Module
              </Link>
              <Link href="/my-submissions" className="text-sm text-gray-600 hover:text-gray-900">
                My Submissions
              </Link>
              <Link href="/leaderboard" className="text-sm text-gray-600 hover:text-gray-900">
                Leaderboard
              </Link>
              <Link
                href="/notifications"
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
                className="relative text-sm text-gray-600 hover:text-gray-900"
              >
                <span aria-hidden="true">🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
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
