"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/notifications")
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data) => setUnreadCount(data.unreadCount || 0))
        .catch(() => setUnreadCount(0));
    } else {
      setUnreadCount(0);
    }
  }, [session]);

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
              <Link href="/my-submissions" className="text-sm text-gray-600 hover:text-gray-900">
                My Submissions
              </Link>
              <Link href="/notifications" className="relative text-sm text-gray-600 hover:text-gray-900">
                Notifications
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
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
