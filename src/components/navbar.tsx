"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5">
        <Link href="/" className="font-display text-lg font-semibold text-text-primary tracking-tight">
          Intern Community Hub
        </Link>

        <div className="flex items-center gap-5">
          {session ? (
            <>
              <Link href="/submit" className="text-sm text-text-secondary transition-colors duration-150 hover:text-amber-400">
                Submit
              </Link>
              <Link href="/my-submissions" className="text-sm text-text-secondary transition-colors duration-150 hover:text-amber-400">
                Submissions
              </Link>
              {session.user.isAdmin && (
                <Link href="/admin" className="text-sm font-medium text-amber-500 transition-colors duration-150 hover:text-amber-400">
                  Admin
                </Link>
              )}
              <div className="h-4 w-px bg-border" />
              <button
                onClick={() => signOut()}
                className="text-sm text-text-tertiary transition-colors duration-150 hover:text-text-secondary"
              >
                Sign out
              </button>
              {session.user.image ? (
                <img src={session.user.image} alt="" className="h-7 w-7 rounded-full ring-1 ring-amber-500/30" />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/20 ring-1 ring-amber-500/30">
                  <span className="text-xs font-medium text-amber-400">{session.user.name?.[0] ?? "?"}</span>
                </div>
              )}
            </>
          ) : (
            <button
              onClick={() => signIn("github")}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-3.5 py-1.5 text-sm font-medium text-black shadow-sm shadow-amber-500/20 transition-colors duration-150 hover:bg-amber-400"
            >
              <GitHubIcon />
              Sign in
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

function GitHubIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
      <path d="M7 0C3.13 0 0 3.13 0 7c0 3.09 2 5.72 4.78 6.65.35.06.48-.15.48-.34v-1.19c-1.94.43-2.35-.94-2.35-.94-.32-.82-.78-1.04-.78-1.04-.64-.44.05-.43.05-.43.71.05 1.09.73 1.09.73.63 1.08 1.65.77 2.05.59.06-.46.24-.77.44-.95-1.56-.18-3.21-.78-3.21-3.47 0-.77.27-1.4.73-1.89-.07-.18-.32-.9.07-1.86 0 0 .59-.19 1.94.73a6.8 6.8 0 0 1 1.8-.24c.61 0 1.22.08 1.8.24 1.35.92 1.94.73 1.94.73.39.96.14 1.68.07 1.86.45.49.73 1.12.73 1.89 0 2.69-1.65 3.29-3.22 3.47.25.22.48.65.48 1.31v1.94c0 .19.13.4.48.34C12 12.72 14 10.09 14 7c0-3.87-3.13-7-7-7z" />
    </svg>
  );
}