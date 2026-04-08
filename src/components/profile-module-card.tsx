import Link from "next/link";
import type { MiniApp, Category } from "@prisma/client";
import { cn, formatRelativeTime } from "@/lib/utils";
import { VoteButton } from "@/components/vote-button";

interface ProfileModuleCardProps {
    module: MiniApp & { category: Category };
    hasVoted: boolean;
    className?: string;
}

export function ProfileModuleCard({
    module,
    hasVoted,
    className
}: ProfileModuleCardProps) {
    return (
        <article
            className={cn(
                "flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md",
                className
            )}
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
                        aria-label={`Open demo for ${module.name}`}
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
                <div className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                        {module.category.name}
                    </span>
                    <span
                        title={module.createdAt.toLocaleString()}
                        className="text-[10px] text-gray-400 cursor-help"
                    >
                        • {formatRelativeTime(module.createdAt)}
                    </span>
                </div>

                <VoteButton
                    moduleId={module.id}
                    initialVoted={hasVoted}
                    initialCount={module.voteCount}
                />
            </div>
        </article>
    );
}

function ExternalLinkIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M5 2H2a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V9" />
            <path d="M8 1h5v5" />
            <path d="M13 1 7 7" />
        </svg>
    );
}