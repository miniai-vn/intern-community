"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // resolvedTheme gives the actual applied theme (handles `system`)
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <>
      <nav className={`border-b transition-colors duration-200 ${isDark ? "border-gray-800 bg-gray-950 text-white" : "border-gray-200 bg-white text-gray-900"}`}>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          {/* Hamburger Menu (Mobile Only) */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle menu"
            type="button"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo - Center on Mobile, Left on Desktop */}
          <Link href="/" className="text-base font-bold md:absolute md:left-4 md:relative">
            Intern Community Hub
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="theme-toggle relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-current cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
              aria-label="Toggle dark mode"
              type="button"
            >
              {mounted ? (
                isDark ? (
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1m-16 0H1m15.364 1.636l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )
              ) : null}
            </button>
            {session ? (
              <>
                <Link href="/submit" className="text-sm text-current transition-opacity hover:opacity-70">
                  Submit Module
                </Link>
                <Link href="/my-favorites" className="text-sm text-current transition-opacity hover:opacity-70">
                  My Favorites ⭐
                </Link>
                <Link href="/my-submissions" className="text-sm text-current transition-opacity hover:opacity-70">
                  My Submissions
                </Link>
                {session.user.isAdmin && (
                  <Link href="/admin" className="text-sm font-medium text-orange-600 transition-colors hover:text-orange-700 dark:text-orange-500 dark:hover:text-orange-400">
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="text-sm text-current transition-opacity hover:opacity-70 cursor-pointer"
                >
                  Sign out
                </button>
                <span className="text-sm text-current">{session.user.name}</span>
              </>
            ) : (
              <button
                onClick={() => signIn("github")}
                className="rounded-lg cursor-pointer bg-gray-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                Sign in with GitHub
              </button>
            )}
          </div>

          {/* Theme Toggle (Mobile) */}
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg text-current transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle dark mode"
            type="button"
          >
            {mounted ? (
              isDark ? (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1m-16 0H1m15.364 1.636l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )
            ) : null}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div
          className={`fixed inset-0 top-16 md:hidden z-40 transition-opacity duration-200 ${menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onClick={() => setMenuOpen(false)}
        >
          <div
            className={`absolute inset-0 ${isDark ? "bg-black/50" : "bg-black/30"}`}
          />
        </div>
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed left-0 top-16 bottom-0 w-64 md:hidden z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isDark ? "bg-gray-900 text-white border-r border-gray-800" : "bg-white text-gray-900 border-r border-gray-200"
        } ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 space-y-2">
          {session ? (
            <>
              <Link
                href="/submit"
                className="block px-4 py-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setMenuOpen(false)}
              >
                Submit Module
              </Link>
              <Link
                href="/my-favorites"
                className="block px-4 py-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setMenuOpen(false)}
              >
                My Favorites ⭐
              </Link>
              <Link
                href="/my-submissions"
                className="block px-4 py-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setMenuOpen(false)}
              >
                My Submissions
              </Link>
              {session.user.isAdmin && (
                <Link
                  href="/admin"
                  className="block px-4 py-2 rounded-lg font-medium text-orange-600 transition-colors hover:bg-gray-100 dark:text-orange-500 dark:hover:bg-gray-800"
                  onClick={() => setMenuOpen(false)}
                >
                  Admin
                </Link>
              )}
              <div className="border-t my-2 border-gray-200 dark:border-gray-700" />
              <div className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                {session.user.name}
              </div>
              <button
                onClick={() => {
                  signOut();
                  setMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                signIn("github");
                setMenuOpen(false);
              }}
              className="block w-full rounded-lg bg-gray-900 px-4 py-2 font-medium text-white transition-colors hover:bg-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              Sign in with GitHub
            </button>
          )}
        </div>
      </div>
    </>
  );
}
