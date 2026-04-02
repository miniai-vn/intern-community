"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { Bell } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-bold text-blue-700">
            Collaborative Lab
          </Link>
          <div className="hidden lg:flex items-center gap-2 text-sm text-slate-600">
            <Link href="/" className="rounded-full px-3 py-1.5 transition hover:bg-blue-50 hover:text-blue-700">
              Explore
            </Link>
            <Link href="/my-submissions" className="rounded-full px-3 py-1.5 transition hover:bg-blue-50 hover:text-blue-700">
              My Submissions
            </Link>
            <Link href="/submit" className="rounded-full px-3 py-1.5 transition hover:bg-blue-50 hover:text-blue-700">
              Submit
            </Link>
          </div>
        </div>

        <div className="hidden md:flex flex-1 justify-center">
          <div className="relative w-full max-w-md">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">🔍</span>
            <input
              type="search"
              placeholder="Search modules..."
              className="w-full rounded-full border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Bell size={18} className="text-slate-400 transition hover:text-blue-600" />
          <Link
            href="/submit"
            className="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Submit Module
          </Link>
          {session ? (
            <>
              <span className="hidden sm:inline-block text-sm font-medium text-slate-700">{session.user?.name}</span>
              <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-sm font-semibold">
                {session.user?.name?.charAt(0) ?? "?"}
              </div>
              <button
                onClick={() => signOut()}
                className="hidden sm:inline-flex rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-800"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn("github")}
              className="rounded-full border border-blue-600 px-3 py-1.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}