import { notFound } from "next/navigation";
import { cache } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { VoteButton } from "@/components/vote-button";

type Props = { params: Promise<{ slug: string }> };

// cache() deduplicates this query within a single request lifecycle.
// Both generateMetadata and the page component call this — Prisma runs once.
const getModule = cache(async (slug: string) => {
  return db.miniApp.findUnique({
    where: { slug, status: "APPROVED" },
    include: {
      category: true,
      author: { select: { id: true, name: true, image: true } },
    },
  });
});

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const module = await getModule(slug);
  return { title: module ? `${module.name} — Intern Community Hub` : "Not Found" };
}

export default async function ModuleDetailPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();

  const module = await db.miniApp.findUnique({
    where: { slug, status: "APPROVED" },
    include: {
      category: true,
      author: { select: { id: true, name: true, image: true } },
    },
  });

  if (!module) notFound();

  let hasVoted = false;
  if (session?.user) {
    const vote = await db.vote.findUnique({
      where: {
        userId_moduleId: { userId: session.user.id, moduleId: module.id },
      },
    });
    hasVoted = !!vote;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-accent"
      >
        ← Back to modules
      </Link>

      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{module.name}</h1>
            <p className="text-sm text-muted">
              by{" "}
              <span className="font-medium text-foreground">{module.author.name}</span>
            </p>
          </div>
          <VoteButton
            moduleId={module.id}
            initialVoted={hasVoted}
            initialCount={module.voteCount}
          />
        </div>

        <div className="mt-3">
          <span className="rounded-full bg-accent-subtle px-2.5 py-0.5 text-xs font-semibold text-accent-subtle-fg">
            {module.category.name}
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold text-foreground">About</h2>
        <p className="text-sm leading-relaxed text-muted">{module.description}</p>
      </div>

      <div className="flex gap-3">
        <a
          href={module.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-accent/40 hover:bg-surface-2"
        >
          View on GitHub
        </a>
        {module.demoUrl && (
          <a
            href={module.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg transition-colors hover:bg-accent-hover"
          >
            Live Demo
          </a>
        )}
      </div>

      {/* TODO [hard-challenge]: Implement sandboxed iframe preview here.
          Requirements:
          - Only show if module.demoUrl exists
          - Use sandbox="allow-scripts allow-same-origin" at minimum
          - Add Content-Security-Policy header for the iframe origin
          - Show a loading skeleton while the iframe loads
          See: ISSUES.md for full acceptance criteria */}
      {module.demoUrl && (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted">
          Sandboxed preview coming soon. Contribute this feature! See{" "}
          <Link href="https://github.com" className="font-medium text-accent hover:underline">
            ISSUES.md
          </Link>
        </div>
      )}
    </div>
  );
}
