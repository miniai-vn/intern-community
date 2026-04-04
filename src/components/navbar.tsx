"use client";

import Link from "next/link";
import Image from "next/image"; // 1. Import component Image
import { useSession, signIn, signOut } from "next-auth/react";
import { Search, Bell } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 !bg-[#F9F9FB]">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-3">

        {/* LEFT: Logo & Links */}
        <div className="flex items-center gap-10">
          <Link href="/" className="text-xl font-bold tracking-tight text-[#2563eb]">
            Collaborative Lab
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-semibold text-[#2563eb] hover:text-blue-600 transition-colors">
              Explore
            </Link>
            {session && (
              <Link href="/my-submissions" className="text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors">
                My Submissions
              </Link>
            )}
          </div>
        </div>

        {/* RIGHT: Search + Actions */}
        <div className="flex items-center gap-6">
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search modules..."
              className="w-80 rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-4">
            <Bell className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-900" />

            {session ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/submit"
                  className="rounded-md bg-[#1d4ed8] px-5 py-2 text-sm font-bold text-white hover:bg-blue-800 transition-all shadow-md"
                >
                  Submit Module
                </Link>

                {/* 2. Thay img bằng Image của Next.js */}
                <Image
                  src={session.user?.image || "/default-avatar.png"} // Thêm ảnh fallback nếu session không có ảnh
                  alt="User Avatar"
                  width={40} // Tương đương h-10
                  height={40} // Tương đương w-10
                  className="rounded-full border-2 border-white object-cover cursor-pointer"
                  onClick={() => signOut()}
                />
              </div>
            ) : (
              <button
                onClick={() => signIn("github")}
                className="rounded-md bg-[#111827] px-6 py-2 text-sm font-bold text-white hover:bg-black transition-all shadow-md"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}