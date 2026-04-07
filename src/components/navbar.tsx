"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const navLinkClass = (href: string) =>
    `text-sm transition-colors ${
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
          <Link href="/leaderboard" className={navLinkClass("/leaderboard")}>
            Leaderboard
          </Link>

          {session ? (
            <>
              <Link href="/submit" className={navLinkClass("/submit")}>
                Submit Module
              </Link>
              <Link href="/my-submissions" className={navLinkClass("/my-submissions")}>
                My Submissions
              </Link>
              {session.user.isAdmin && (
                <Link
                  href="/admin"
                  className={
                    pathname === "/admin"
                      ? "text-sm font-medium text-orange-700"
                      : "text-sm font-medium text-orange-600 hover:text-orange-700"
                  }
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
