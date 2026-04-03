import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { FollowButton } from "@/components/follow-button";

const statusStyles: Record<string, string> = {
  APPROVED: "bg-green-50 text-green-700 border-green-200",
};

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const user = await db.user.findUnique({
    where: { id },
    select: { name: true },
  });

  return {
    title: user?.name ? `${user.name} - Profile` : "Profile",
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  const user = await db.user.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          submissions: true,
          comments: true,
          followers: true,
        },
      },
      submissions: {
        where: { status: "APPROVED" },
        include: { category: true },
        orderBy: { createdAt: "desc" },
      },
      comments: {
        include: {
          module: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!user) notFound();

  const isOwnProfile = session?.user?.id === user.id;
  const isFollowing = session?.user
    ? Boolean(
        await db.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: session.user.id,
              followingId: user.id,
            },
          },
          select: { id: true },
        })
      )
    : false;

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
                Creator profile
              </span>
              <div>
                <h1 className="text-4xl font-semibold tracking-tight text-stone-950">
                  {user.name ?? "Community member"}
                </h1>
                <p className="mt-2 text-base leading-7 text-stone-600">
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {!isOwnProfile && (
              <FollowButton
                targetUserId={user.id}
                initialFollowing={isFollowing}
                initialFollowerCount={user._count.followers}
                canFollow={Boolean(session?.user)}
              />
            )}
            <Link
              href="/"
              className="rounded-full border border-stone-300 bg-white/90 px-5 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-100"
            >
              Back to modules
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Total submissions" value={user.submissions.length} />
        <StatCard label="Comments posted" value={user._count.comments} />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-stone-800">Published activity</h2>

          {user.submissions.length === 0 ? (
            <div className="section-shell rounded-[1.8rem] border-dashed p-12 text-center">
              <p className="text-lg font-medium text-stone-800">
                No submissions available.
              </p>
              <p className="mt-2 text-sm text-stone-500">
                This creator has not shared any modules yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {user.submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="glass-panel flex flex-col gap-4 rounded-[1.6rem] p-5 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0 space-y-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-stone-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-600">
                          {submission.category.name}
                        </span>
                        <span className="text-xs text-stone-400">
                          {new Date(submission.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-lg font-semibold text-stone-950">
                        <Link
                          href={`/modules/${submission.slug}`}
                          className="hover:text-emerald-900"
                        >
                          {submission.name}
                        </Link>
                      </p>
                    </div>
                    <p className="line-clamp-2 whitespace-pre-wrap text-sm leading-6 text-stone-600">
                      {submission.description}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-green-700">
                    APPROVED
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="glass-panel rounded-[1.6rem] p-5">
          <h2 className="text-lg font-semibold text-stone-800">Recent comments</h2>

          {user.comments.length === 0 ? (
            <p className="mt-4 text-sm text-stone-500">
              No public comment activity yet.
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
