import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ProfileHeader } from "@/components/profile-header";
import { ProfileModuleList } from "@/components/profile-module-list";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ userId: string }>;
}) {
    const { userId } = await params;
    const user = await db.user.findUnique({
        where: { id: userId },
        select: { name: true },
    });
    if (!user) return { title: "Profile not found" };
    return { title: `${user.name} — Intern Community` };
}

export default async function ProfilePage({
    params,
}: {
    params: Promise<{ userId: string }>;
}) {
    const { userId } = await params;
    const session = await auth();

    const user = await db.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            image: true,
            createdAt: true,
            submissions: {
                where: { status: "APPROVED" },
                include: { category: true },
                orderBy: { voteCount: "desc" },
            },
        },
    });

    if (!user) notFound();

    const totalVotes = user.submissions.reduce((sum, m) => sum + m.voteCount, 0);

    let votedIds: string[] = [];
    if (session?.user) {
        const votes = await db.vote.findMany({
            where: {
                userId: session.user.id,
                moduleId: { in: user.submissions.map((m) => m.id) },
            },
            select: { moduleId: true },
        });
        votedIds = votes.map((v) => v.moduleId);
    }

    const approvedCount = user.submissions.length;

    return (
        <div className="space-y-8">
            <ProfileHeader
                user={user}
                approvedCount={approvedCount}
            />

            <section>
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                    Approved Modules ({approvedCount})
                </h2>

                <ProfileModuleList
                    modules={user.submissions}
                    votedIds={votedIds}
                    initialTotalVotes={totalVotes}
                />
            </section>
        </div>
    );
}