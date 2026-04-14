"use client";

import { useState } from "react";
import { ModuleCard } from "@/components/module-card";
import type { Module } from "@/types";

type ModuleWithVoteState = Module & {
    hasVoted?: boolean;
};

interface ModuleListProps {
    initialModules: ModuleWithVoteState[];
    initialNextCursor: string | null;
    q?: string;
    category?: string;
}

export function ModuleList({
    initialModules,
    initialNextCursor,
    q,
    category,
}: ModuleListProps) {
    const [modules, setModules] = useState(initialModules);
    const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    async function loadMore() {
        if (!nextCursor || isLoadingMore) return;

        setIsLoadingMore(true);
        try {
            const params = new URLSearchParams();
            params.set("cursor", nextCursor);
            if (q) params.set("q", q);
            if (category) params.set("category", category);

            const res = await fetch(`/api/modules?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to load more modules");

            const data = await res.json();

            setModules((prev) => [...prev, ...data.items]);
            setNextCursor(data.nextCursor);
        } finally {
            setIsLoadingMore(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {modules.map((module) => (
                    <ModuleCard
                        key={module.id}
                        module={module}
                        hasVoted={module.hasVoted}
                    />
                ))}
            </div>

            {nextCursor && (
                <div className="flex justify-center">
                    <button
                        onClick={loadMore}
                        disabled={isLoadingMore}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isLoadingMore ? "Loading..." : "Load more"}
                    </button>
                </div>
            )}
        </div>
    );
}