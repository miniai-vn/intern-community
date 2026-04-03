"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b border-slate-800 bg-gradient-to-r from-slate-950 to-slate-900">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-base font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Intern Community Hub
        </Link>

        <div className="flex items-center gap-6">
          {session ? (
            <>
              <Link href="/submit" className="text-sm text-slate-300 hover:text-purple-400 transition">
                Submit Module
              </Link>
              <Link href="/my-submissions" className="text-sm text-slate-300 hover:text-purple-400 transition">
                My Submissions
              </Link>
              {session.user.isAdmin && (
                <Link href="/admin" className="text-sm font-medium text-orange-400 hover:text-orange-300 transition">
                  Admin
                </Link>
              )}
              <button
                onClick={() => signOut()}
                className="text-sm text-slate-400 hover:text-slate-200 transition"
              >
                Sign out
              </button>
              <span className="text-sm text-slate-300">{session.user.name}</span>
            </>
          ) : (
            <button
              onClick={() => signIn("github")}
              className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-medium text-white hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition"
            >
              Sign in with GitHub
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
