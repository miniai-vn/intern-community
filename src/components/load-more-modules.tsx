"use client";

import { useState } from "react";
import { ModuleCard } from "./module-card";
import type { Module } from "@/types";

interface Props {
    initialNextCursor: string | null;
    q?: string;
    category?: string;
}

export function LoadMoreModules({ initialNextCursor, q, category }: Props) {
    const [modules, setModules] = useState<(Module & { hasVoted: boolean })[]>([]);
    const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
    const [isLoading, setIsLoading] = useState(false);

    const loadMore = async () => {
        if (!nextCursor || isLoading) return;
        setIsLoading(true);

        try {
            const qs = new URLSearchParams();
            qs.set("cursor", nextCursor);
            if (q) qs.set("q", q);
            if (category) qs.set("category", category);

            const res = await fetch(`/api/modules?${qs.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch modules");

            const data = await res.json();
            setModules((prev) => [...prev, ...data.items]);
            setNextCursor(data.nextCursor);
        } catch {
            alert("Failed to load more modules.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!nextCursor && modules.length === 0) {
        return null;
    }

    return (
        <>
            {modules.map((module) => (
                <ModuleCard
                    key={module.id}
                    module={module}
                    hasVoted={module.hasVoted}
                />
            ))}

            {nextCursor && (
                <div className="col-span-full mt-4 flex justify-center">
                    <button
                        onClick={loadMore}
                        disabled={isLoading}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {isLoading ? "Loading..." : "Load more"}
                    </button>
                </div>
            )}
        </>
    );
}
