"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { io, type Socket } from "socket.io-client";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const notificationMenuRef = useRef<HTMLDivElement | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/submit", label: "Submit Module" },
    { href: "/my-submissions", label: "My Submissions" },
    ...(session?.user.isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  const visibleNotifications = useMemo(
    () => notifications.slice(0, 8),
    [notifications],
  );

  useEffect(() => {
    if (!session?.user) {
      setNotifications([]);
      setUnreadCount(0);
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    let isMounted = true;

    async function loadNotifications() {
      setIsLoadingNotifications(true);
      try {
        const res = await fetch("/api/notifications", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted) return;
        setNotifications(data.notifications ?? []);
        setUnreadCount(data.unreadCount ?? 0);
      } finally {
        if (isMounted) setIsLoadingNotifications(false);
      }
    }

    loadNotifications();
    const timer = window.setInterval(loadNotifications, 60_000);

    return () => {
      isMounted = false;
      window.clearInterval(timer);
    };
  }, [session?.user]);

  useEffect(() => {
    if (!session?.user) return;
    const userId = session.user.id;

    let disposed = false;

    async function connectRealtime() {
      // Initialize Socket.IO server once, then connect client-side socket.
      await fetch("/api/socket");
      if (disposed) return;

      const socket = io({
        path: "/api/socket/io",
      });

      socket.on("connect", () => {
        socket.emit("notifications:subscribe", userId);
      });

      socket.on("notification:new", (payload: NotificationItem) => {
        setNotifications((prev) => {
          const exists = prev.some((item) => item.id === payload.id);
          if (exists) return prev;
          return [payload, ...prev];
        });
        setUnreadCount((prev) => prev + 1);
      });

      socketRef.current = socket;
    }

    connectRealtime();

    return () => {
      disposed = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [session?.user]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node;
      const clickedNotificationMenu =
        notificationMenuRef.current?.contains(target);
      const clickedUserMenu = userMenuRef.current?.contains(target);

      if (!clickedNotificationMenu && !clickedUserMenu) {
        setIsNotificationOpen(false);
        setIsUserMenuOpen(false);
      }
    }

    if (isNotificationOpen || isUserMenuOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isNotificationOpen, isUserMenuOpen]);

  async function markOneAsRead(id: string) {
    const target = notifications.find((item) => item.id === id);
    if (!target || target.isRead) return;

    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }

  async function markAllAsRead() {
    if (unreadCount === 0) return;

    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);

    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
  }

  function isNavItemActive(href: string) {
    const currentPath = pathname ?? "/";
    if (href === "/") return currentPath === "/";
    return currentPath === href || currentPath.startsWith(`${href}/`);
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-indigo-300/10 bg-slate-950/70 backdrop-blur-xl shadow-[0_0_30px_rgba(124,77,255,0.06)]">
      <div className="mx-auto flex h-16 w-full max-w-360 items-center justify-between px-4 sm:px-8">
        <Link
          href="/"
          className="text-xl font-black tracking-tight text-white transition hover:text-violet-200 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
        >
          InternHub
        </Link>

        <div className="flex items-center gap-3 sm:gap-6">
          {session ? (
            <>
              <section
                className="hidden items-center gap-6 md:flex"
                aria-label="Main navigation"
              >
                {navItems.map((item) => {
                  const isActive = isNavItemActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "relative text-[14px] font-bold tracking-tight transition focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300",
                        isActive
                          ? "text-white"
                          : "text-slate-400 hover:text-white",
                      )}
                    >
                      {item.label}
                      <span
                        aria-hidden="true"
                        className={cn(
                          "pointer-events-none absolute -bottom-1 left-0 h-0.5 rounded-full bg-violet-300 transition-all duration-200",
                          isActive ? "w-full opacity-100" : "w-0 opacity-0",
                        )}
                      />
                    </Link>
                  );
                })}
              </section>

              <div className="hidden items-center gap-2 text-slate-400 sm:flex">
                <div ref={notificationMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNotificationOpen((prev) => !prev);
                      setIsUserMenuOpen(false);
                    }}
                    className="relative rounded-lg p-2 cursor-pointer transition hover:bg-white/5 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
                    aria-label="Notifications"
                    aria-haspopup="menu"
                    aria-expanded={isNotificationOpen}
                  >
                    <BellIcon />
                    {unreadCount > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-500 px-1 text-[10px] font-bold text-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {isNotificationOpen && (
                    <section
                      role="menu"
                      className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-indigo-300/15 bg-slate-900/95  shadow-[0_20px_50px_rgba(8,10,24,0.65)]"
                    >
                      <div className=" flex items-center justify-between border-b border-indigo-300/10 p-4">
                        <p className="text-xs font-semibold uppercase  text-slate-300">
                          Notifications
                        </p>
                        <button
                          type="button"
                          onClick={markAllAsRead}
                          className="text-[11px] font-medium text-violet-300 transition hover:text-violet-200 disabled:opacity-40"
                          disabled={unreadCount === 0}
                        >
                          Mark all read
                        </button>
                      </div>

                      {isLoadingNotifications ? (
                        <p className="rounded-lg px-3 py-4 text-xs text-slate-400">
                          Loading notifications...
                        </p>
                      ) : visibleNotifications.length === 0 ? (
                        <p className="rounded-lg px-3 py-4 text-xs text-slate-400">
                          No notifications yet.
                        </p>
                      ) : (
                        <div className="max-h-80 space-y-1 overflow-x-hidden p-2 overflow-y-auto">
                          {visibleNotifications.map((item) => {
                            const itemClass = cn(
                              "block min-w-0 w-full overflow-hidden rounded-lg border px-3 py-2 text-left transition mr-100",
                              item.isRead
                                ? "border-indigo-300/10 bg-slate-900 text-slate-400 hover:bg-slate-800/70"
                                : "border-violet-400/25 bg-violet-500/10 text-slate-200 hover:bg-violet-500/20",
                            );

                            if (item.link) {
                              return (
                                <Link
                                  key={item.id}
                                  href={item.link}
                                  onClick={() => {
                                    void markOneAsRead(item.id);
                                    setIsNotificationOpen(false);
                                  }}
                                  className={itemClass}
                                >
                                  <p className="truncate text-xs font-semibold">
                                    {item.title}
                                  </p>
                                  <p className="mt-0.5 line-clamp-2 break-all text-xs leading-5">
                                    {item.message}
                                  </p>
                                  <p className="mt-1 text-[10px] text-slate-500">
                                    {formatNotificationTime(item.createdAt)}
                                  </p>
                                </Link>
                              );
                            }

                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                  void markOneAsRead(item.id);
                                }}
                                className={itemClass}
                              >
                                <p className="truncate text-xs font-semibold">
                                  {item.title}
                                </p>
                                <p className="mt-0.5 line-clamp-2 break-all text-xs leading-5">
                                  {item.message}
                                </p>
                                <p className="mt-1 text-[10px] text-slate-500">
                                  {formatNotificationTime(item.createdAt)}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </section>
                  )}
                </div>
              </div>

              <div className="hidden h-7 w-px bg-white/10 sm:block" />

              <div ref={userMenuRef} className="relative flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen((prev) => !prev);
                    setIsNotificationOpen(false);
                  }}
                  aria-haspopup="menu"
                  aria-expanded={isUserMenuOpen}
                  aria-label="Open user menu"
                  className="rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
                >
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User profile"}
                      className="h-7 w-7 rounded-full border border-violet-300/30 object-cover"
                    />
                  ) : (
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-violet-300/30 bg-slate-800 text-xs font-semibold text-slate-200">
                      {(session.user.name || "U").slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </button>

                {isUserMenuOpen && (
                  <section
                    role="menu"
                    className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-indigo-300/15 bg-slate-900/95 p-2 shadow-[0_20px_50px_rgba(8,10,24,0.65)]"
                  >
                    <p className="truncate px-2 pt-1 text-xs font-semibold text-slate-100">
                      {session.user.name || "User"}
                    </p>
                    {session.user.email && (
                      <p className="truncate px-2 pb-2 text-[11px] text-slate-400">
                        {session.user.email}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => signOut()}
                      className="mt-1 w-full rounded-lg px-2 py-2 text-left text-xs font-semibold text-slate-200 transition hover:bg-white/5 hover:text-violet-200"
                    >
                      Sign out
                    </button>
                  </section>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={() => signIn("github")}
              className="rounded-full bg-linear-to-r from-violet-500 to-indigo-500 px-4 py-2 text-xs font-semibold text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 active:scale-[0.99]"
            >
              Sign in with GitHub
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

function formatNotificationTime(value: string) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  return date.toLocaleDateString();
}

function BellIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M6 8.5A6 6 0 0 1 18 8.5V13L20 16H4L6 13V8.5Z" />
      <path d="M10 18C10.4 19.2 11.1 20 12 20C12.9 20 13.6 19.2 14 18" />
    </svg>
  );
}
