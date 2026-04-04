import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { VoteButton } from "@/components/vote-button";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const module = await db.miniApp.findUnique({ where: { slug } });
  return {
    title: module ? `${module.name} — Intern Community Hub` : "Không tìm thấy",
  };
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

  const formattedDate = new Intl.DateTimeFormat("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(module.createdAt));

  return (
    <div className="space-y-6 py-4">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-blue-600"
      >
        <span aria-hidden>←</span> Về danh sách module
      </Link>

      <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/40 transition-shadow duration-300 hover:shadow-2xl hover:shadow-blue-200/30">
        <div className="space-y-6 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1 space-y-3">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                {module.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-indigo-100 bg-indigo-50/50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  {module.category.name}
                </span>
                <span className="text-xs font-medium text-gray-400">{formattedDate}</span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end sm:gap-3">
              <div className="flex items-center gap-2">
                {module.demoUrl && (
                  <a
                    href={module.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Xem bản demo"
                    aria-label={`Xem bản demo của ${module.name}`}
                    className="rounded-xl bg-blue-50 p-2.5 text-blue-600 transition-all hover:bg-blue-600 hover:text-white"
                  >
                    <ExternalLinkIcon />
                  </a>
                )}
                <a
                  href={module.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Mã nguồn GitHub"
                  aria-label={`Xem mã nguồn ${module.name} trên GitHub`}
                  className="rounded-xl bg-gray-50 p-2.5 text-gray-600 transition-all hover:bg-gray-900 hover:text-white"
                >
                  <GitHubIcon />
                </a>
              </div>
              <VoteButton
                moduleId={module.id}
                initialVoted={hasVoted}
                initialCount={module.voteCount}
              />
            </div>
          </div>

          <p className="text-base leading-relaxed text-gray-600 sm:text-lg">{module.description}</p>

          <div className="flex flex-wrap gap-3">
            <a
              href={module.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-800 shadow-sm ring-1 ring-gray-100 transition-all hover:border-gray-300 hover:bg-gray-50"
            >
              Xem trên GitHub
            </a>
            {module.demoUrl && (
              <a
                href={module.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Mở bản demo
              </a>
            )}
          </div>

          <div className="flex items-center gap-3 border-t border-gray-100 pt-6">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-2 ring-white shadow-md">
              {module.author.image ? (
                <Image
                  src={module.author.image}
                  alt={module.author.name || "Tác giả"}
                  width={44}
                  height={44}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm font-bold text-gray-400">
                  {module.author.name?.[0] || "?"}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{module.author.name || "Ẩn danh"}</p>
              <p className="text-xs font-medium text-gray-400">Tác giả</p>
            </div>
          </div>

          {module.demoUrl && (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center">
              <p className="text-sm font-medium text-gray-600">
                Xem trước nhúng (sandbox) sẽ có trong phiên bản sau.
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Tham khảo tiêu chí trong <code className="rounded bg-gray-100 px-1">ISSUES.md</code> nếu bạn muốn
                đóng góp tính năng này.
              </p>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}
