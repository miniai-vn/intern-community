import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProfileSubmissions } from "@/components/profile-submissions";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      _count: {
        select: {
          submissions: true,
          votes: true,
          comments: true,
          followers: true,
        },
      },
      submissions: {
        include: { category: true },
        orderBy: { createdAt: "desc" },
      },
      comments: {
        include: {
          module: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!user) redirect("/");

  const approvedCount = user.submissions.filter(
    (submission) => submission.status === "APPROVED"
  ).length;

  return (
    <div className="space-y-8">
      <section className="section-shell rounded-[2rem] px-6 py-8 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name ?? "Profile avatar"}
                className="h-20 w-20 rounded-[1.6rem] border border-stone-200 object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-[1.6rem] bg-stone-900 text-2xl font-semibold text-stone-50">
                {(user.name ?? "U").slice(0, 1).toUpperCase()}
              </div>
            )}

            <div className="space-y-3">
              <span className="inline-flex rounded-full bg-stone-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-stone-50">
                Profile
              </span>
              <div>
                <h1 className="text-4xl font-semibold tracking-tight text-stone-950">
                  {user.name ?? "Community member"}
                </h1>
                <p className="mt-2 text-base leading-7 text-stone-600">
                  {user.email ?? "GitHub account connected"} · Joined{" "}
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/submit"
              className="rounded-full bg-emerald-950 px-5 py-3 text-sm font-semibold text-emerald-50 shadow-lg shadow-emerald-950/15 hover:bg-emerald-900"
            >
              Submit Module
            </Link>
            <Link
              href="/my-submissions"
              className="rounded-full border border-stone-300 bg-white/90 px-5 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-100"
            >
              My Submissions
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total submissions" value={user._count.submissions} />
        <StatCard label="Approved modules" value={approvedCount} />
        <StatCard label="Votes cast" value={user._count.votes} />
        <StatCard label="Comments posted" value={user._count.comments} />
        <StatCard label="Followers" value={user._count.followers} />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-stone-800">
              Submission history
            </h2>
            <Link
              href="/my-submissions"
              className="text-sm font-medium text-emerald-800 hover:text-emerald-950"
            >
              View all
            </Link>
          </div>

          {user.submissions.length === 0 ? (
            <div className="section-shell rounded-[1.8rem] border-dashed p-12 text-center">
              <p className="text-lg font-medium text-stone-800">No submissions yet.</p>
              <p className="mt-2 text-sm text-stone-500">
                Start building your profile by sharing your first module.
              </p>
            </div>
          ) : (
            <ProfileSubmissions submissions={user.submissions} />
          )}
        </section>

        <div className="space-y-6">
          <section className="glass-panel rounded-[1.6rem] p-5">
            <h2 className="text-lg font-semibold text-stone-800">Recent comments</h2>

            {user.comments.length === 0 ? (
              <p className="mt-4 text-sm text-stone-500">
                Join discussions on modules and your recent comments will appear here.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {user.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="rounded-2xl border border-stone-200 bg-white/70 px-4 py-3"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                      On {comment.module.name}
                    </p>
                    <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-stone-700">
                      {comment.body}
                    </p>
                    <Link
                      href={`/modules/${comment.module.slug}`}
                      className="mt-2 inline-block text-sm font-medium text-emerald-800 hover:text-emerald-950"
                    >
                      Open module
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass-panel rounded-[1.5rem] px-5 py-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">
        {value}
      </p>
    </div>
  );
}
