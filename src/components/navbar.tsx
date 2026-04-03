"use client";

import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { AccountMenu } from "@/components/account-menu";
import { NotificationMenu } from "@/components/notification-menu";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-30 border-b border-stone-200/70 bg-[#f7f4eb]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-950 text-sm font-bold text-emerald-50 shadow-lg shadow-emerald-950/15">
            IC
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold uppercase tracking-[0.22em] text-emerald-800/80">
              Community Hub
            </span>
            <span className="block truncate text-base font-semibold text-stone-900">
              Intern Community
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/leaderboard"
            className="hidden rounded-full border border-stone-300 bg-white/80 px-4 py-2 text-sm font-semibold text-stone-700 hover:border-stone-400 hover:bg-stone-100 hover:text-stone-950 sm:inline-flex"
          >
            Leaderboard
          </Link>
          {session ? (
            <>
              <Link
                href="/submit"
                className="hidden rounded-full bg-emerald-950 px-4 py-2 text-sm font-semibold text-emerald-50 shadow-lg shadow-emerald-950/15 hover:bg-emerald-900 sm:inline-flex"
              >
                Submit Module
              </Link>
              <NotificationMenu />
              <AccountMenu
                name={session.user.name}
                isAdmin={session.user.isAdmin}
              />
            </>
          ) : (
            <button
              onClick={() => signIn("github")}
              className="rounded-full bg-emerald-950 px-4 py-2 text-sm font-semibold text-emerald-50 shadow-lg shadow-emerald-950/20 hover:-translate-y-0.5 hover:bg-emerald-900"
            >
              Sign in with GitHub
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
