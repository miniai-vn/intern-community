// Created by Cursor
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { VoteButton } from "@/components/vote-button";

type ModuleListItem = {
    id: string;
    slug: string;
    name: string;
    description: string;
    demoUrl: string | null;
    voteCount: number;
    hasVoted: boolean;
    category: { name: string };
    author: { id: string; name: string | null; image: string | null };
};

type ModulesApiResponse = {
    items: Array<{
        id: string;
        slug: string;
        name: string;
        description: string;
        demoUrl: string | null;
        voteCount: number;
        hasVoted?: boolean;
        category: { name: string };
        author: { id: string; name: string | null; image: string | null };
    }>;
    nextCursor: string | null;
};

type ModuleListProps = {
    initialItems: ModuleListItem[];
    initialNextCursor: string | null;
};

function ExternalLinkIcon() {
    return (
        <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
        >
            <path d="M5 2H2a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V9" />
            <path d="M8 1h5v5" />
            <path d="M13 1 7 7" />
        </svg>
    );
}

export function ModuleList({ initialItems, initialNextCursor }: ModuleListProps) {
    const searchParams = useSearchParams();
    const [items, setItems] = useState<ModuleListItem[]>(initialItems);
    const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

    async function loadMore() {
        if (!nextCursor || isLoadingMore) return;

        setIsLoadingMore(true);
        setLoadMoreError(null);

        try {
            const params = new URLSearchParams(searchParams.toString());
            params.set("cursor", nextCursor);

            const res = await fetch(`/api/modules?${params.toString()}`);
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `HTTP ${res.status}`);
            }

            const data = (await res.json()) as ModulesApiResponse;

            setItems((prev) => [
                ...prev,
                ...data.items.map((m) => ({
                    id: m.id,
                    slug: m.slug,
                    name: m.name,
                    description: m.description,
                    demoUrl: m.demoUrl,
                    voteCount: m.voteCount,
                    hasVoted: !!m.hasVoted,
                    category: { name: m.category.name },
                    author: {
                        id: m.author.id,
                        name: m.author.name,
                        image: m.author.image,
                    },
                })),
            ]);
            setNextCursor(data.nextCursor);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unexpected error";
            setLoadMoreError(message);
        } finally {
            setIsLoadingMore(false);
        }
    }

    return (
        <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((module) => (
                    <article
                        key={module.id}
                        className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <Link
                                href={`/modules/${module.slug}`}
                                className="text-base font-semibold text-gray-900 hover:text-blue-600 hover:underline"
                            >
                                {module.name}
                            </Link>
                            {module.demoUrl && (
                                <a
                                    href={module.demoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`Open demo for ${module.name} module`}
                                    className="shrink-0 text-gray-400 hover:text-gray-600"
                                >
                                    <ExternalLinkIcon />
                                </a>
                            )}
                        </div>

                        <p className="line-clamp-2 text-sm text-gray-600">
                            {module.description}
                        </p>

                        <div className="mt-auto flex items-center justify-between">
                            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                                {module.category.name}
                            </span>

                            <VoteButton
                                moduleId={module.id}
                                initialVoted={module.hasVoted}
                                initialCount={module.voteCount}
                            />
                        </div>
                    </article>
                ))}
            </div>

            {nextCursor && (
                <div className="flex flex-col items-center gap-2">
                    <button
                        type="button"
                        onClick={loadMore}
                        disabled={isLoadingMore}
                        aria-busy={isLoadingMore}
                        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isLoadingMore ? "Loading…" : "Load more"}
                    </button>
                    {loadMoreError && (
                        <p className="text-sm text-red-600">
                            [API Error]: {loadMoreError}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

