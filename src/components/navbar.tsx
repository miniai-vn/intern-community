"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { NotificationBell } from "./notification-bell";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors ${
        isActive
          ? "border-b-2 border-blue-600 text-gray-900"
          : "border-b-2 border-transparent text-gray-600 hover:text-gray-900"
      }`}
    >
      {children}
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-base font-bold text-gray-900">
          Intern Community Hub
        </Link>

        <div className="flex items-center gap-6">
          {/* Public links - visible to everyone */}
          <NavLink href="/leaderboard">Leaderboard</NavLink>

          {session ? (
            <>
              <NavLink href="/submit">Submit Module</NavLink>
              <NavLink href="/my-submissions">My Submissions</NavLink>
              {session.user.isAdmin && (
                <Link
                  href="/admin"
                  className={`text-sm font-medium transition-colors ${
                    pathname === "/admin"
                      ? "border-b-2 border-orange-600 text-orange-700"
                      : "border-b-2 border-transparent text-orange-600 hover:text-orange-700"
                  }`}
                >
                  Admin
                </Link>
              )}
              {/* Notification Bell */}
              <NotificationBell />
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-400 hover:text-gray-600 hover:cursor-pointer"
              >
                Sign out
              </button>
              <span className="text-sm text-gray-700">{session.user.name}</span>
            </>
          ) : (
            <button
              onClick={() => signIn("github")}
              suppressHydrationWarning
              className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 hover:cursor-pointer"
            >
              Sign in with GitHub
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
