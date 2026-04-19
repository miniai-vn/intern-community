"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export function Navbar() {
  const { data: session } = useSession();
  const [isMounted, setIsMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <nav
      className={`sticky top-0 z-50 navbar-glass transition-all duration-300 ${
        scrolled ? "shadow-lg shadow-indigo-500/5" : ""
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25 transition-transform group-hover:scale-110">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Intern<span className="gradient-text">Hub</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-1">
          {session ? (
            <>
              <Link
                href="/submit"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                Submit Module
              </Link>
              <Link
                href="/my-submissions"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                My Submissions
              </Link>
              {session.user.isAdmin && (
                <Link
                  href="/admin"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-amber-600 transition-colors hover:bg-amber-50 hover:text-amber-700"
                >
                  Admin
                </Link>
              )}

              <div className="mx-2 h-5 w-px bg-slate-200" />

              {/* User avatar + name */}
              <div className="flex items-center gap-2">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt=""
                    className="h-7 w-7 rounded-full ring-2 ring-white shadow-sm"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-xs font-semibold text-white shadow-sm">
                    {session.user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}
                <span className="text-sm font-medium text-slate-700">
                  {session.user.name}
                </span>
              </div>

              <button
                onClick={() => signOut()}
                className="ml-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn("github")}
              className="btn-shimmer inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30 hover:brightness-110"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              Sign in with GitHub
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
