"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { NotificationBell } from "@/components/notification-bell";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-base font-bold text-gray-900">
          Intern Community Hub
        </Link>

        <div className="flex items-center gap-4">
          {session ? (
            <>
              {session.user.isAdmin && (
                <Link href="/admin" className="text-sm font-medium text-orange-600 hover:text-orange-700">
                  Admin
                </Link>
              )}
              {!session.user.isAdmin && (
                <>
                  <Link href="/submit" className="text-sm text-gray-600 hover:text-gray-900">
                    Submit Module
                  </Link>
                  <Link href="/my-submissions" className="text-sm text-gray-600 hover:text-gray-900">
                    My Submissions
                  </Link>
                </>
              )}
              <NotificationBell />
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                Sign out
              </button>
              <span className="text-sm text-gray-700">{session.user.name}</span>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => signIn("github")}
                className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700"
              >
                Sign in with GitHub
              </button>
              <button
                onClick={() => signIn("google")}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
              >
                Sign in with Google
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
