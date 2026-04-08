"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { Cube, Code, SignOut, User, PlusCircle, FolderOpen, Shield } from "@phosphor-icons/react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-600 border-b border-blue-700/20">
      <div className="flex items-center justify-between px-8 py-4">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
            <Cube weight="bold" className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">
            Intern Community Hub
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {session ? (
            <>
              <Link 
                href="/submit" 
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
              >
                <PlusCircle weight="regular" className="w-4 h-4" />
                <span className="hidden sm:inline">Submit Module</span>
              </Link>
              <Link 
                href="/my-submissions" 
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
              >
                <FolderOpen weight="regular" className="w-4 h-4" />
                <span className="hidden sm:inline">My Submissions</span>
              </Link>
              {session.user.isAdmin && (
                <Link 
                  href="/admin" 
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-200 hover:text-orange-100 hover:bg-orange-500/20 rounded-lg transition-all duration-200"
                >
                  <Shield weight="regular" className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}
              <div className="flex items-center gap-2 pl-2 border-l border-white/20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <User weight="bold" className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-white hidden sm:inline">
                    {session.user.name}
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                  title="Sign out"
                >
                  <SignOut weight="regular" className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => signIn("github")}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition-all duration-200 border border-white/30"
            >
              <Code weight="bold" className="w-4 h-4" />
              Sign in with GitHub
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
