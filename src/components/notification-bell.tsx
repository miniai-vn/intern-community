"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

// Polls /api/notifications/count every 30s and on window focus.
// Mirrors the spec: "polling on page focus is acceptable".
export function NotificationBell() {
    const { data: session } = useSession();
    const [count, setCount] = useState(0);
    // Track mount state to avoid setState after unmount
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (!session?.user) return;

        const fetchCount = async () => {
            try {
                const res = await fetch("/api/notifications/count");
                if (res.ok && isMountedRef.current) {
                    const data = await res.json();
                    setCount(data.count ?? 0);
                }
            } catch {
                // silent — badge stays as-is on network error
            }
        };

        fetchCount();

        const interval = setInterval(fetchCount, 30_000);
        window.addEventListener("focus", fetchCount);

        return () => {
            clearInterval(interval);
            window.removeEventListener("focus", fetchCount);
        };
    }, [session?.user]);

    if (!session?.user) return null;

    return (
        <Link
            href="/notifications"
            className="relative text-gray-600 hover:text-gray-900"
            aria-label={
                count > 0
                    ? `${count} unread notification${count > 1 ? "s" : ""}`
                    : "Notifications"
            }
        >
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                aria-hidden="true"
            >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>

            {count > 0 && (
                <span
                    className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
                    aria-hidden="true"
                >
                    {count > 9 ? "9+" : count}
                </span>
            )}
        </Link>
    );
}
