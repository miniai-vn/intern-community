"use client";

import { useEffect, useState } from "react";

const cn = (...classes: string[]) => classes.filter(Boolean).join(" ");

export function BackToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 10);
        window.addEventListener("scroll", onScroll, { passive: true });

        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            className={cn(
                "fixed bottom-6 right-6 z-50",
                "rounded-full w-10 h-10",
                "bg-gray-900 text-white shadow-lg",
                "flex items-center justify-center",
                "hover:bg-gray-700 hover:-translate-y-0.5 hover:shadow-xl",
                "transition-all duration-200",
                visible
                    ? "opacity-100 pointer-events-auto translate-y-0"
                    : "opacity-0 pointer-events-none translate-y-2"
            )}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M18 15l-6-6-6 6" />
            </svg>
        </button>
    );
}