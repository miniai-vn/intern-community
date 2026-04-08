"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/notification-bell";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-base font-bold text-gray-900">
          Intern Community Hub
        </Link>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          {session ? (
            <>
              <NotificationBell />
              <Link href="/submit" className="text-sm text-gray-600 hover:text-gray-900">
                Submit Module
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
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="h-7 w-7 rounded-full object-cover"
                />
              ) : (
                <span className="text-sm text-gray-700">{session.user.name}</span>
              )}
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
