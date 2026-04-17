import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { VoteButton } from "@/components/vote-button";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const miniApp = await db.miniApp.findUnique({ where: { slug } });
  return { title: miniApp ? `${miniApp.name} — Intern Community Hub` : "Not Found" };
}

export default async function ModuleDetailPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();

  const miniApp = await db.miniApp.findUnique({
    where: { slug, status: "APPROVED" },
    include: {
      category: true,
      author: { select: { id: true, name: true, image: true } },
    },
  });

  if (!miniApp) notFound();

  let hasVoted = false;
  if (session?.user) {
    const vote = await db.vote.findUnique({
      where: {
        userId_moduleId: { userId: session.user.id, moduleId: miniApp.id },
      },
    });
    hasVoted = !!vote;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors group">
        <span className="mr-1 group-hover:-translate-x-1 transition-transform">←</span> Back to modules
      </Link>

      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{miniApp.name}</h1>
          <VoteButton
            moduleId={miniApp.id}
            initialVoted={hasVoted}
            initialCount={miniApp.voteCount}
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{miniApp.author.name}</span>
          <span>·</span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
            {miniApp.category.name}
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <p className="text-foreground leading-relaxed whitespace-pre-wrap">{miniApp.description}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <a
          href={miniApp.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors shadow-sm"
        >
          View on GitHub
        </a>
        {miniApp.demoUrl && (
          <a
            href={miniApp.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all shadow-sm"
          >
            Live Demo
          </a>
        )}
      </div>

      {miniApp.demoUrl && (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground bg-muted/30">
          <p className="font-medium text-foreground mb-1">Sandboxed preview coming soon</p>
          <p>Contribute this feature! See <Link href="/ISSUES.md" className="text-primary hover:underline">ISSUES.md</Link></p>
        </div>
      )}
    </div>
  );
}
