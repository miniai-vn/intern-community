import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { VoteButton } from "@/components/vote-button";
import { SandboxedDemoPreview } from "@/components/sandboxed-demo-preview";

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

  const safeDemoUrl = getHttpsUrl(miniApp.demoUrl);

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
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to modules
      </Link>

      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-foreground">{miniApp.name}</h1>
          <VoteButton
            moduleId={miniApp.id}
            initialVoted={hasVoted}
            initialCount={miniApp.voteCount}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          by {miniApp.author.name} · {miniApp.category.name}
        </p>
      </div>

      <p className="text-foreground">{miniApp.description}</p>

      <div className="flex gap-3">
        <a
          href={miniApp.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary text-sm"
        >
          View on GitHub
        </a>
        {miniApp.demoUrl && (
          <a
            href={miniApp.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-sm"
          >
            Live Demo
          </a>
        )}
      </div>

        {safeDemoUrl && (
          <SandboxedDemoPreview demoUrl={safeDemoUrl} moduleName={miniApp.name} />
        )}
    </div>
  );
}

  function getHttpsUrl(url?: string | null): string | null {
    if (!url) return null;

    try {
      const parsed = new URL(url);
      return parsed.protocol === "https:" ? parsed.toString() : null;
    } catch {
      return null;
    }
  }
