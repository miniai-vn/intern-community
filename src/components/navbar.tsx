"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  LogIn,
  LogOut,
  Plus,
  FileText,
  Shield,
  User,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileOpen(!isMobileOpen);

  return (
      <nav className="backdrop-blur-xl bg-white/80 border-b border-white/50 shadow-xl sticky top-0 z-50 supports-[backdrop-filter:blur()]:bg-white/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">

          {/* Logo */}
          <Link
              href="/"
              className="group flex items-center gap-3 text-2xl font-black bg-gradient-to-r from-gray-900 via-orange-600 to-blue-600 bg-clip-text text-transparent hover:scale-105 transition-all duration-300"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-blue-500 rounded-2xl shadow-lg group-hover:shadow-xl group-hover:rotate-3 transition-all duration-300 flex items-center justify-center">
              <span className="text-xl font-bold text-white">🚀</span>
            </div>
            Intern Hub
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-2 lg:gap-6">

            {session ? (
                <>
                  <Link
                      href="/submit"
                      className="group flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold text-gray-700
                bg-white/50 backdrop-blur-sm border border-gray-200/50 hover:bg-white hover:shadow-lg
                hover:-translate-y-0.5 hover:text-orange-600 transition-all duration-300"
                  >
                    <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    Submit
                  </Link>

                  <Link
                      href="/my-submissions"
                      className="group flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold text-gray-700
                bg-white/50 backdrop-blur-sm border border-gray-200/50 hover:bg-white hover:shadow-lg
                hover:-translate-y-0.5 hover:text-blue-600 transition-all duration-300"
                  >
                    <FileText className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    My Modules
                  </Link>

                  {session.user.isAdmin && (
                      <Link
                          href="/admin"
                          className="group flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold
                  bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-xl
                  hover:from-orange-600 hover:to-orange-700 hover:-translate-y-1 transition-all duration-300"
                      >
                        <Shield className="h-4 w-4" />
                        Admin
                      </Link>
                  )}
                </>
            ) : null}
          </div>

          {/* Right side: User & Mobile toggle */}
          <div className="flex items-center gap-3 lg:gap-4">

            {/* User Avatar / Sign In */}
            {session ? (
                <div className="flex items-center gap-3">
                  <button
                      onClick={() => signOut()}
                      className="group flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold text-gray-700
                bg-white/50 backdrop-blur-sm border border-gray-200/50 hover:bg-rose-50 hover:text-rose-600
                hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                      title="Sign out"
                  >
                    <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span className="hidden sm:inline">Sign out</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-blue-500 rounded-2xl shadow-lg flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <span className="hidden md:inline text-sm font-semibold text-gray-900 truncate max-w-[120px]">
                  {session.user.name}
                </span>
                  </div>
                </div>
            ) : (
                <button
                    onClick={() => signIn("github")}
                    className="group flex items-center gap-2 bg-gradient-to-r from-gray-900 to-black hover:from-gray-800 hover:to-gray-900
              px-6 py-3 rounded-2xl text-sm font-bold text-white shadow-xl hover:shadow-2xl
              hover:-translate-y-1 active:translate-y-0 transition-all duration-300 transform"
                >
                  <LogIn className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>Sign in</span>
                </button>
            )}

            {/* Mobile menu button */}
            <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 rounded-xl bg-white/60 backdrop-blur-sm border border-gray-200/50
            hover:bg-white hover:shadow-lg transition-all duration-300"
            >
              {isMobileOpen ? (
                  <X className="h-5 w-5" />
              ) : (
                  <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileOpen && (
            <div className="lg:hidden backdrop-blur-xl bg-white/90 border-t border-gray-200/50 shadow-2xl">
              <div className="px-4 py-6 space-y-4">
                {session ? (
                    <>
                      <Link
                          href="/submit"
                          className="flex items-center gap-3 p-4 rounded-2xl bg-white hover:bg-orange-50 hover:shadow-lg transition-all"
                          onClick={() => setIsMobileOpen(false)}
                      >
                        <Plus className="h-5 w-5 text-orange-600" />
                        Submit Module
                      </Link>

                      <Link
                          href="/my-submissions"
                          className="flex items-center gap-3 p-4 rounded-2xl bg-white hover:bg-blue-50 hover:shadow-lg transition-all"
                          onClick={() => setIsMobileOpen(false)}
                      >
                        <FileText className="h-5 w-5 text-blue-600" />
                        My Submissions
                      </Link>

                      {session.user.isAdmin && (
                          <Link
                              href="/admin"
                              className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-xl"
                              onClick={() => setIsMobileOpen(false)}
                          >
                            <Shield className="h-5 w-5" />
                            Admin
                          </Link>
                      )}

                      <button
                          onClick={() => {
                            signOut();
                            setIsMobileOpen(false);
                          }}
                          className="flex w-full items-center gap-3 p-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition-all"
                      >
                        <LogOut className="h-5 w-5" />
                        Sign out
                      </button>
                    </>
                ) : (
                    <button
                        onClick={() => {
                          signIn("github");
                          setIsMobileOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gray-900 to-black
                px-6 py-4 rounded-2xl text-base font-bold text-white shadow-xl hover:shadow-2xl transition-all"
                    >
                      <LogIn className="h-5 w-5" />
                      Sign in with GitHub
                    </button>
                )}
              </div>
            </div>
        )}
      </nav>
  );
}