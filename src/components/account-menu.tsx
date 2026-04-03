"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface AccountMenuProps {
  name?: string | null;
  isAdmin: boolean;
}

export function AccountMenu({ name, isAdmin }: AccountMenuProps) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/80 px-3 py-2 text-sm font-medium text-stone-700 hover:border-stone-400 hover:text-stone-950"
        aria-label="Open account menu"
        aria-expanded={isOpen}
      >
        <span className="hidden max-w-32 truncate md:inline">{name ?? "Account"}</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-900 text-xs font-semibold text-stone-50">
          {(name ?? "A").slice(0, 1).toUpperCase()}
        </span>
        <ChevronDownIcon />
      </button>

      {isOpen && (
        <div className="glass-panel absolute right-0 top-14 z-40 w-56 rounded-[1.4rem] p-2 shadow-2xl shadow-stone-900/10">
          <div className="border-b border-stone-200 px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
              Signed in
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-stone-900">
              {name ?? "Community member"}
            </p>
          </div>

          <div className="mt-2 space-y-1">
            <MenuLink href="/profile" onSelect={() => setIsOpen(false)}>
              Profile
            </MenuLink>
            <MenuLink href="/my-submissions" onSelect={() => setIsOpen(false)}>
              My Submissions
            </MenuLink>
            {isAdmin && (
              <MenuLink href="/admin" onSelect={() => setIsOpen(false)}>
                Admin
              </MenuLink>
            )}
            <button
              type="button"
              onClick={() => signOut()}
              className="flex w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-700 hover:bg-red-50"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  children,
  onSelect,
}: {
  href: string;
  children: React.ReactNode;
  onSelect: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onSelect}
      className="flex rounded-xl px-3 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-100 hover:text-stone-950"
    >
      {children}
    </Link>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
