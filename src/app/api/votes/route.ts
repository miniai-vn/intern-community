import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// Sliding-window rate limit backed by PostgreSQL (via VoteEvent table).
// Max 10 vote actions per 60-second window per user.
//
// Why not in-memory Map?
//   - Resets on every server restart / cold start
//   - Each serverless instance has its own Map → rate limit is per-instance, not per-user
//   - Completely ineffective in production (Vercel, AWS Lambda, etc.)
//
// Why not Redis/Upstash?
//   - Viable alternative, but adds external infrastructure dependency
//   - For this project's scale, PostgreSQL is already available and sufficient
//   - The composite index on (userId, createdAt) keeps this query fast
//
// Trade-off: one extra DB read per vote action (~1-2ms with index) vs. zero infrastructure overhead.

const RATE_LIMIT_WINDOW_MS = 60_000; // 60 seconds
const RATE_LIMIT_MAX_ACTIONS = 10;

async function checkRateLimit(userId: string): Promise<boolean> {
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);

    const recentActions = await db.voteEvent.count({
        where: {
            userId,
            createdAt: { gte: windowStart },
        },
    });

    return recentActions < RATE_LIMIT_MAX_ACTIONS;
}

// POST /api/votes — toggle vote on a module
export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await checkRateLimit(session.user.id))) {
        return NextResponse.json(
            { error: "Too many votes. Please wait a moment." },
            { status: 429 },
        );
    }

    const { moduleId } = await req.json();
    if (!moduleId || typeof moduleId !== "string") {
        return NextResponse.json({ error: "moduleId is required" }, { status: 400 });
    }

    const existing = await db.vote.findUnique({
        where: { userId_moduleId: { userId: session.user.id, moduleId } },
    });

    // Log the vote action for rate limiting (before the actual vote toggle)
    await db.voteEvent.create({
        data: { userId: session.user.id },
    });

    if (existing) {
        // Un-vote
        await db.$transaction([
            db.vote.delete({ where: { id: existing.id } }),
            db.miniApp.update({
                where: { id: moduleId },
                data: { voteCount: { decrement: 1 } },
            }),
        ]);
        return NextResponse.json({ voted: false });
    } else {
        // Vote
        await db.$transaction([
            db.vote.create({
                data: { userId: session.user.id, moduleId },
            }),
            db.miniApp.update({
                where: { id: moduleId },
                data: { voteCount: { increment: 1 } },
            }),
        ]);
        return NextResponse.json({ voted: true });
    }
}
