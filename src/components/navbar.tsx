"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function navLinkActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const linkClass = (href: string) =>
    cn(
      "rounded-lg px-2 py-1.5 text-sm font-medium transition-colors",
      navLinkActive(pathname, href)
        ? "bg-blue-50 text-blue-700"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    );

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/95 shadow-sm backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/"
          className="shrink-0 text-base font-extrabold tracking-tight text-gray-900"
        >
          Intern{" "}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Community
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden flex-1 items-center justify-end gap-1 md:flex">
          {session ? (
            <>
              <Link href="/submit" className={linkClass("/submit")}>
                Gửi module
              </Link>
              <Link href="/my-submissions" className={linkClass("/my-submissions")}>
                Bài nộp của tôi
              </Link>
              {session.user.isAdmin && (
                <Link
                  href="/admin"
                  className={cn(
                    "rounded-lg px-2 py-1.5 text-sm font-semibold transition-colors",
                    navLinkActive(pathname, "/admin")
                      ? "bg-orange-50 text-orange-700"
                      : "text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                  )}
                >
                  Quản trị
                </Link>
              )}
              <div className="mx-2 h-6 w-px bg-gray-200" aria-hidden />
              <div className="flex items-center gap-2 pl-1">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt=""
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full ring-2 ring-gray-100"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
                    {(session.user.name || "?")[0]}
                  </div>
                )}
                <span className="max-w-[140px] truncate text-sm font-medium text-gray-800">
                  {session.user.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => signOut()}
                className="ml-1 rounded-lg px-2 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-800"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => signIn("github")}
              className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-gray-800 hover:shadow-lg"
            >
              Đăng nhập với GitHub
            </button>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
          onClick={() => setMobileOpen((o) => !o)}
        >
          {mobileOpen ? <IconX /> : <IconMenu />}
        </button>
      </div>

      {/* Mobile panel */}
      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-4 md:hidden">
          {session ? (
            <div className="flex flex-col gap-2">
              <div className="mb-2 flex items-center gap-3 border-b border-gray-100 pb-3">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt=""
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full ring-2 ring-gray-100"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-500">
                    {(session.user.name || "?")[0]}
                  </div>
                )}
                <span className="font-medium text-gray-900">{session.user.name}</span>
              </div>
              <Link href="/submit" className={cn(linkClass("/submit"), "block")}>
                Gửi module
              </Link>
              <Link href="/my-submissions" className={cn(linkClass("/my-submissions"), "block")}>
                Bài nộp của tôi
              </Link>
              {session.user.isAdmin && (
                <Link
                  href="/admin"
                  className={cn(
                    "block rounded-lg px-2 py-1.5 text-sm font-semibold transition-colors",
                    navLinkActive(pathname, "/admin")
                      ? "bg-orange-50 text-orange-700"
                      : "text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                  )}
                >
                  Quản trị
                </Link>
              )}
              <button
                type="button"
                onClick={() => signOut()}
                className="mt-2 rounded-lg py-2 text-left text-sm text-gray-500 hover:text-gray-800"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => signIn("github")}
              className="w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white"
            >
              Đăng nhập với GitHub
            </button>
          )}
        </div>
      )}
    </nav>
  );
}

function IconMenu() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function IconX() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
