import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { VoteButton } from "@/components/vote-button";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const module = await db.miniApp.findUnique({ where: { slug } });
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
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-up">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-text-tertiary transition-colors duration-150 hover:text-amber-400">
        ← Back to modules
      </Link>

      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-display text-3xl font-semibold text-text-primary tracking-tight leading-tight">
            {module.name}
          </h1>
          <VoteButton
            moduleId={module.id}
            initialVoted={hasVoted}
            initialCount={module.voteCount}
          />
        </div>
        <p className="text-sm text-text-secondary">
          by {module.author.name} · {module.category.name}
        </p>
      </div>

      <p className="leading-relaxed text-text-secondary">{module.description}</p>

      <div className="flex gap-3">
        <a
          href={module.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-raised px-5 py-2.5 text-sm font-medium text-text-primary transition-all duration-150 hover:border-border-strong hover:bg-surface"
        >
          <GitHubIcon />
          View on GitHub
        </a>
        {module.demoUrl && (
          <a
            href={module.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-medium text-black shadow-sm shadow-amber-500/25 transition-colors duration-150 hover:bg-amber-400"
          >
            <ExternalIcon />
            Live Demo
          </a>
        )}
      </div>

      {module.demoUrl && (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-text-tertiary">Sandboxed preview coming soon. Contribute this feature!</p>
        </div>
      )}
    </div>
  );
}

function GitHubIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
      <path d="M7 0C3.13 0 0 3.13 0 7c0 3.09 2 5.72 4.78 6.65.35.06.48-.15.48-.34v-1.19c-1.94.43-2.35-.94-2.35-.94-.32-.82-.78-1.04-.78-1.04-.64-.44.05-.43.05-.43.71.05 1.09.73 1.09.73.63 1.08 1.65.77 2.05.59.06-.46.24-.77.44-.95-1.56-.18-3.21-.78-3.21-3.47 0-.77.27-1.4.73-1.89-.07-.18-.32-.9.07-1.86 0 0 .59-.19 1.94.73a6.8 6.8 0 0 1 1.8-.24c.61 0 1.22.08 1.8.24 1.35.92 1.94.73 1.94.73.39.96.14 1.68.07 1.86.45.49.73 1.12.73 1.89 0 2.69-1.65 3.29-3.22 3.47.25.22.48.65.48 1.31v1.94c0 .19.13.4.48.34C12 12.72 14 10.09 14 7c0-3.87-3.13-7-7-7z" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M5 1.5H1.5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-3.5" />
      <path d="M7 .5h4.5v4.5" />
      <path d="M11.5.5 6 6" />
    </svg>
  );
}