"use client";

import { useState } from "react";
import { ModuleCard } from "@/components/module-card";
import type { Module } from "@/types";

type ModulesFeedProps = {
    initialItems: Module[];
    initialNextCursor: string | null;
    q?: string;
    category?: string;
    initialVotedIds: string[];
};

export function ModulesFeed({
    initialItems,
    initialNextCursor,
    q,
    category,
    initialVotedIds,
}: ModulesFeedProps) {
    const [items, setItems] = useState<Module[]>(initialItems);
    const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function loadMore() {
        if (!nextCursor || isLoading) return;

        setIsLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            params.set("cursor", nextCursor);
            if (q) params.set("q", q);
            if (category) params.set("category", category);

            const res = await fetch(`/api/modules?${params.toString()}`, {
                method: "GET",
                cache: "no-store",
            });

            if (!res.ok) {
                throw new Error("Failed to load more modules");
            }

            const data: { items: Module[]; nextCursor: string | null } = await res.json();

            setItems((prev) => [...prev, ...data.items]);
            setNextCursor(data.nextCursor);
        } catch {
            setError("Could not load more modules. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    const votedIdSet = new Set(initialVotedIds);

    return (
        <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((module) => (
                    <ModuleCard
                        key={module.id}
                        module={module}
                        hasVoted={votedIdSet.has(module.id)}
                    />
                ))}
            </div>

            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}

            {nextCursor && (
                <div className="flex justify-center">
                    <button
                        type="button"
                        onClick={loadMore}
                        disabled={isLoading}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isLoading ? "Loading..." : "Load more"}
                    </button>
                </div>
            )}
        </div>
    );
}