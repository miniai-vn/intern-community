"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

export function Navbar() {
  const { data: session } = useSession();
  const isLoggedIn = Boolean(session);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const linkClassName =
    "rounded-md px-2 py-1 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900";
  const adminLinkClassName =
    "rounded-md bg-orange-50 px-2 py-1 text-sm font-medium text-orange-700 transition-colors hover:bg-orange-100";

  const navLinks = [
    { href: "/submit", label: "Submit Module" },
    { href: "/my-submissions", label: "My Submissions" },
    { href: "/bookmarks", label: "My Bookmarks" },
    { href: "/admin", label: "Admin", adminOnly: true },
  ];

  const visibleLinks = navLinks.filter(
    (link) => !link.adminOnly || session?.user?.isAdmin
  );

  return (
    <nav className="w-full border-b border-gray-200 bg-white/95">
      <div className="mx-auto w-full max-w-5xl px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex w-fit items-center text-base font-bold tracking-tight text-gray-900">
            Intern Community Hub
          </Link>

          {isLoggedIn ? (
            <>
              <div className="hidden items-center gap-2 lg:flex">
                {visibleLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={
                      link.adminOnly ? adminLinkClassName : linkClassName
                    }>
                    {link.label}
                  </Link>
                ))}
                <button
                  onClick={() => signOut()}
                  className="rounded-md px-2 py-1 text-sm text-gray-500 transition-colors hover:bg-red-200 hover:text-red-500">
                  Sign out
                </button>
                <span className="text-sm font-medium text-gray-700">
                  {session?.user?.name ?? "User"}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 lg:hidden"
                aria-expanded={isMenuOpen}
                aria-label="Toggle navigation menu">
                Menu
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn("github")}
              className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700">
              Sign in with GitHub
            </button>
          )}
        </div>

        {isLoggedIn && isMenuOpen && (
          <div className="fixed right-4 mt-3 space-y-2 rounded-xl border border-gray-200 bg-white p-3 shadow-sm lg:hidden">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={
                  link.adminOnly
                    ? `${adminLinkClassName} block`
                    : `${linkClassName} block`
                }>
                {link.label}
              </Link>
            ))}
            <div className="flex items-center justify-between flex-wrap border-t border-gray-100 pt-2">
              <span className="text-sm font-medium text-gray-700">
                {session?.user?.name ?? "User"}
              </span>
              <button
                onClick={() => signOut()}
                className="rounded-md px-2 py-1 text-sm text-gray-500 transition-colors hover:bg-red-200 hover:text-red-500">
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
