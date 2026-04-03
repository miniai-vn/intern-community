"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="navbar-bg">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-base font-bold text-foreground">
          Intern Community Hub
        </Link>

        <div className="flex items-center gap-4">
          {session ? (
            <>
              <Link href="/submit" className="text-sm text-muted-foreground hover:text-foreground">
                Submit Module
              </Link>
              <Link href="/my-submissions" className="text-sm text-muted-foreground hover:text-foreground">
                My Submissions
              </Link>
              {session.user.isAdmin && (
                <Link href="/admin" className="text-sm font-medium text-[var(--primary)] hover:opacity-80">
                  Admin
                </Link>
              )}
              <button
                onClick={() => signOut()}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Sign out
              </button>
              <span className="text-sm text-foreground">{session.user.name}</span>
            </>
          ) : (
            <button
              onClick={() => signIn("github")}
              className="btn-primary text-sm px-3 py-1.5"
            >
              Sign in with GitHub
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
