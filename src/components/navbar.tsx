"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  return (
    //?: Optimize the UI/UX to make it more responsive and suitable for mobile phones.
    <nav className="sticky top-0 z-50 border-b border-gray-800 bg-black/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

        {/* LOGO */}
        <Link href="/" className="group flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-600 transition-transform group-hover:rotate-12" />
          <span className="text-lg font-extrabold tracking-tight text-white">
            Intern Community <span className="text-blue-500">Hub</span>
          </span>
        </Link>

        {/* //!: DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-8">
          {session ? (
            <>
              <div className="flex items-center gap-6 border-r border-gray-800 pr-6">
                <Link href="/submit" className="text-sm font-semibold text-gray-400 transition-colors hover:text-white">
                  Submit Module
                </Link>
                <Link href="/my-submissions" className="text-sm font-semibold text-gray-400 transition-colors hover:text-white">
                  My Submissions
                </Link>
                {session.user.isAdmin && (
                  <Link href="/admin" className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-500 ring-1 ring-inset ring-orange-500/20 hover:bg-orange-500/20">
                    Admin
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 rounded-full bg-gray-900/50 p-1 pr-3 ring-1 ring-gray-800">
                  {session.user.image && (
                    <img
                      src={session.user.image}
                      alt="avatar"
                      className="h-7 w-7 rounded-full border border-gray-700 object-cover shadow-sm"
                    />
                  )}
                  <span className="text-xs font-medium text-gray-200">{session.user.name}</span>
                </div>

                <button
                  onClick={() => signOut()}
                  className="text-xs font-medium text-gray-500 transition-colors hover:text-red-400"
                >
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => signIn("github")}
              className="relative flex items-center gap-2 overflow-hidden rounded-full bg-white px-5 py-2 text-sm font-bold text-black transition-all hover:bg-gray-200 active:scale-95"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.412-4.041-1.412-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
              Sign in
            </button>
          )}
        </div>

        {/* //!: MOBILE BUTTON */}
        <button
          onClick={() => setOpen(!open)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-800 bg-gray-900/50 text-white transition-colors hover:bg-gray-800 md:hidden"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* //!: MOBILE MENU */}
      {open && (
        <div className="border-t border-gray-800 bg-black/95 px-6 py-6 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-6">
            {session ? (
              <>
                <Link href="/submit" onClick={() => setOpen(false)} className="text-lg font-semibold text-gray-300">Submit Module</Link>
                <Link href="/my-submissions" onClick={() => setOpen(false)} className="text-lg font-semibold text-gray-300">My Submissions</Link>
                <div className="h-[1px] bg-gray-800" />
                <div className="flex items-center gap-3">
                  <img src={session.user.image} className="h-10 w-10 rounded-full border border-gray-700" alt="avatar" />
                  <span className="font-bold text-white">{session.user.name}</span>
                </div>
                <button
                  onClick={() => { signOut(); setOpen(false); }}
                  className="w-full rounded-xl bg-red-500/10 py-3 text-sm font-bold text-red-500"
                >
                  Sign out
                </button>
              </>
            ) : (
              <button
                onClick={() => signIn("github")}
                className="w-full rounded-xl bg-white py-4 text-sm font-bold text-black"
              >
                Sign in with GitHub
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
