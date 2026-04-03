"use client";

import { useEffect, useState } from "react";

type BannerType = "success" | "error" | "info";

export function NotifyBannerHost() {
    const [message, setMessage] = useState<string | null>(null);
    const [type, setType] = useState<BannerType>("info");

    useEffect(() => {
        function onNotify(e: Event) {
            const detail = (e as CustomEvent).detail as { type?: BannerType; message: string; durationMs?: number };
            setType(detail.type ?? "info");
            setMessage(detail.message);
            const timeout = setTimeout(() => setMessage(null), detail.durationMs ?? 2500);
            return () => clearTimeout(timeout);
        }
        window.addEventListener("app:notify", onNotify as EventListener);
        return () => window.removeEventListener("app:notify", onNotify as EventListener);
    }, []);

    if (!message) return null;

    const color =
        type === "success"
            ? "bg-green-600 text-white"
            : type === "error"
                ? "bg-red-600 text-white"
                : "bg-blue-600 text-white";

    return (
        <div className="pointer-events-none fixed inset-x-0 top-14 z-50 flex justify-center px-4">
            <div className={`pointer-events-auto rounded-full ${color} px-3 py-1.5 text-xs shadow-lg`}>
                {message}
            </div>
        </div>
    );
}

export function notifyBanner(params: { message: string; type?: BannerType; durationMs?: number }) {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent("app:notify", { detail: params }));
}
