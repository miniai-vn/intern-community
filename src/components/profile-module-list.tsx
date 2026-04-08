"use client";

import { useState, useCallback } from "react";
import { useOptimisticVote } from "@/hooks/use-optimistic-vote";
import { useSession } from "next-auth/react";
import Link from "next/link";
import type { MiniApp, Category } from "@prisma/client";
import { formatRelativeTime } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────

type ModuleWithCategory = MiniApp & { category: Category };

interface ProfileModuleListProps {
    modules: ModuleWithCategory[];
    votedIds: string[];
    initialTotalVotes: number;
}

interface ProfileModuleCardProps {
    module: ModuleWithCategory;
    initialVoted: boolean;
    onVoteChange: (delta: 1 | -1) => void;
}

// ─── ProfileModuleList ───────────────────────────────────────────────────────

export function ProfileModuleList({
    modules,
    votedIds,
    initialTotalVotes,
}: ProfileModuleListProps) {
    const [totalVotes, setTotalVotes] = useState(initialTotalVotes);

    const handleVoteChange = useCallback((delta: 1 | -1) => {
        setTotalVotes((prev) => prev + delta);
    }, []);

    if (modules.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
                <p className="text-gray-500">No approved modules yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <p className="text-sm text-gray-500">
                Total votes:{" "}
                <span className="font-semibold text-gray-900">{totalVotes}</span>
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {modules.map((module) => (
                    <ProfileModuleCard
                        key={module.id}
                        module={module}
                        initialVoted={votedIds.includes(module.id)}
                        onVoteChange={handleVoteChange}
                    />
                ))}
            </div>
        </div>
    );
}

// ─── ProfileModuleCard ───────────────────────────────────────────────────────

function ProfileModuleCard({
    module,
    initialVoted,
    onVoteChange,
}: ProfileModuleCardProps) {
    const { data: session } = useSession();
    const { voted, count, isLoading, toggle } = useOptimisticVote({
        moduleId: module.id,
        initialVoted,
        initialCount: module.voteCount,
    });

    const handleToggle = async () => {
        const delta: 1 | -1 = voted ? -1 : 1;
        await toggle();
        onVoteChange(delta);
    };

    return (
        <article className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
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
                        aria-label={`Open demo for ${module.name}`}
                        className="shrink-0 text-gray-400 hover:text-gray-600"
                    >
                        <ExternalLinkIcon />
                    </a>
                )}
            </div>

            <p className="line-clamp-2 text-sm text-gray-600">{module.description}</p>

            <div className="mt-auto flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                        {module.category.name}
                    </span>
                    <span
                        title={module.createdAt.toLocaleString()}
                        className="cursor-help text-[10px] text-gray-400"
                    >
                        · {formatRelativeTime(module.createdAt)}
                    </span>
                </div>

                {session ? (
                    <button
                        onClick={handleToggle}
                        disabled={isLoading}
                        aria-label={voted ? "Remove vote" : "Upvote this module"}
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium transition-colors
              disabled:cursor-not-allowed disabled:opacity-50
              ${voted
                                ? "bg-orange-100 text-orange-600 hover:bg-orange-200"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        <TriangleIcon filled={voted} />
                        {count}
                    </button>
                ) : (
                    <span className="inline-flex items-center gap-1 text-sm text-gray-400">
                        <TriangleIcon />
                        {count}
                    </span>
                )}
            </div>
        </article>
    );
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function ExternalLinkIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M5 2H2a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V9" />
            <path d="M8 1h5v5" />
            <path d="M13 1 7 7" />
        </svg>
    );
}

function TriangleIcon({ filled = false }: { filled?: boolean }) {
    return (
        <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill={filled ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
        >
            <path d="M6 1 L11 10 L1 10 Z" />
        </svg>
    );
}