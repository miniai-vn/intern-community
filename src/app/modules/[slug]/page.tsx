import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { VoteButton } from "@/components/vote-button";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const app = await db.miniApp.findUnique({ where: { slug } });
  return { title: app ? `${app.name} — Intern Community Hub` : "Not Found" };
}

export default async function ModuleDetailPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();

  const app = await db.miniApp.findUnique({
    where: { slug, status: "APPROVED" },
    include: {
      category: true,
      author: { select: { id: true, name: true, image: true } },
    },
  });

  if (!app) notFound();

  let hasVoted = false;
  if (session?.user) {
    const vote = await db.vote.findUnique({
      where: {
        userId_moduleId: { userId: session.user.id, moduleId: app.id },
      },
    });
    hasVoted = !!vote;
  }

  return (
    <div className="relative z-10 mx-auto max-w-2xl space-y-6">
      <Link href="/" className="text-sm text-slate-400 hover:text-slate-300 transition">
        ← Quay lại danh sách
      </Link>

      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{app.name}</h1>
          <VoteButton
            moduleId={app.id}
            initialVoted={hasVoted}
            initialCount={app.voteCount}
          />
        </div>
        <p className="text-sm text-slate-400">
          by {app.author.name} · {app.category.name}
        </p>
      </div>

      <p className="text-slate-300 leading-relaxed">{app.description}</p>

      <div className="flex gap-3">
        <a
          href={app.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-gradient-to-r from-slate-700 to-slate-800 px-4 py-2 text-sm font-medium text-slate-100 hover:shadow-[0_0_10px_rgba(168,85,247,0.2)] transition"
        >
          🔗 GitHub
        </a>
        {app.demoUrl && (
          <a
            href={app.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-medium text-white hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition"
          >
            🚀 Live Demo
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
      {app.demoUrl && (
        <div className="rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 text-center border border-slate-700">
          <p className="text-sm text-slate-400 mb-2">📦 Sandboxed preview sắp có</p>
          <p className="text-xs text-slate-500">Đóng góp feature này tại <Link href="https://github.com" className="text-purple-400 hover:text-purple-300">ISSUES.md</Link></p>
        </div>
      )}
    </div>
  );
}
