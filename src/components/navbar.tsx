"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { ThemeToggle } from "./theme-provider";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-base font-bold text-gray-900 dark:text-white">
            Intern Community Hub
          </Link>
          <Link href="/leaderboard" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
            🏆 Leaderboard
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          {session ? (
            <>
              <Link href="/submit" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                Submit Module
              </Link>
              <Link href="/my-submissions" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                My Submissions
              </Link>
              {session.user.isAdmin && (
                <Link href="/admin" className="text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300">
                  Admin
                </Link>
              )}
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                Sign out
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-200">{session.user.name}</span>
            </>
          ) : (
            <button
              onClick={() => signIn("github")}
              className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              Sign in with GitHub
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
