"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <nav className="h-20 flex w-3/5 max-lg:w-[95%]">
      <div className="flex w-full items-center justify-between">
        <Link
          href="/"
          className="text-2xl text-dim-skye font-bold scale-100 duration-300 ease-in hover:text-deep-ocen hover:scale-95 active:text-dim-skye"
        >
          <p className="md:hidden">TCH</p>
          <p className="max-md:hidden">Intern Community Hub</p>
        </Link>
        <div className="flex items-center gap-4">
          {session ? (
            <>
              <Link
                href="/submit"
                className="text-deep-ocen font-bold duration-300 ease-in hover:text-dim-skye active:text-deep-ocen max-md:hidden"
              >
                <div className="group relative flex flex-col">
                  <p>Submit Module</p>
                  <span className="absolute top-full mt-px h-0.5 w-0 left-1/2 -translate-x-1/2 bg-dim-skye duration-300 ease-in-out group-hover:w-full"></span>
                </div>
              </Link>
              <Link
                href="/my-submissions"
                className="text-deep-ocen font-bold duration-300 ease-in hover:text-dim-skye active:text-deep-ocen max-md:hidden"
              >
                <div className="group relative flex flex-col">
                  <p>My Submissions</p>
                  <span className="absolute top-full mt-px h-0.5 w-0 left-1/2 -translate-x-1/2 bg-dim-skye duration-300 ease-in-out group-hover:w-full"></span>
                </div>
              </Link>
              <div
                ref={menuRef}
                onClick={() => setIsOpen(!isOpen)}
                className="relative w-30 max-md:w-50 shadow-default rounded-lg"
              >
                <p className=" w-full text-center z-2 font-bold truncate text-white p-2 bg-deep-ocen border-2 border-deep-ocen rounded-lg">
                  {session.user.name}
                </p>
                <div className={`absolute z-1 w-full top-full left-0 mt-1 flex flex-col gap-1 items-center overflow-hidden duration-300 ease-in-out ${isOpen ? "opacity-100 max-h-50" : "opacity-0 max-h-0"}`}>
                  <Link
                    href="/submit"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center w-full p-2 border-2 border-deep-ocen bg-white rounded-lg shadow-default duration-300 ease-in hover:bg-deep-ocen hover:text-white md:hidden"
                  >
                    Submit Module
                  </Link>
                  <Link
                    href="/my-submissions"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center w-full p-2 border-2 border-deep-ocen bg-white rounded-lg shadow-default duration-300 ease-in hover:bg-deep-ocen hover:text-white md:hidden"
                  >
                    My Submissions
                  </Link>
                  {session.user.isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center w-full p-2 border-2 border-deep-ocen bg-white rounded-lg shadow-default duration-300 ease-in hover:bg-deep-ocen hover:text-white"
                    >
                      Manager
                    </Link>
                  )}
                  <button
                    onClick={() => {signOut(); setIsOpen(false)}}
                    className="flex items-center justify-center w-full p-2 border-2 border-deep-ocen bg-white rounded-lg shadow-default cursor-pointer duration-300 ease-in hover:bg-red-400 hover:text-white"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <button
              onClick={() => signIn("github")}
              className="bg-deep-ocen p-2 rounded-lg border-2 border-deep-ocen text-cloud duration-300 ease-in scale-100 hover:bg-cloud hover:text-deep-ocen active:scale-95"
            >
              Sign in with GitHub
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
