import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";


const lastPostAt = new Map<string, number>();

function canPost(userId: string, moduleId: string) {
    const key = `${userId}:${moduleId}`;
    const now = Date.now();
    const last = lastPostAt.get(key) ?? 0;
    if (now - last < 5000) return false;
    lastPostAt.set(key, now);
    return true;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: moduleId } = await params;

        const prisma = db as any;
        const comments = await prisma.moduleComment.findMany({
            where: { moduleId, parentId: null },
            orderBy: { createdAt: "desc" },
            take: 10,
            include: {
                author: { select: { id: true, name: true, image: true } },
                replies: {
                    orderBy: { createdAt: "asc" },
                    include: { author: { select: { id: true, name: true, image: true } } },
                },
            },
        });

        return NextResponse.json(comments);
    } catch (err) {
        console.error("GET /comments error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}


export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id: moduleId } = await params;
        const { content, parentId } = await req.json();

        const text = (content ?? "").trim();
        if (text.length < 2) return NextResponse.json({ error: "Too short" }, { status: 400 });
        if (text.length > 1000) return NextResponse.json({ error: "Too long" }, { status: 400 });
        if (!canPost(session.user.id, moduleId)) {
            return NextResponse.json({ error: "Too fast" }, { status: 429 });
        }

        const exists = await db.miniApp.findFirst({ where: { id: moduleId, status: "APPROVED" } });
        if (!exists) return NextResponse.json({ error: "Module not found" }, { status: 404 });

        // If replying, only admin can create admin replies.
        if (parentId) {
            if (!session.user.isAdmin) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }

            const prisma = db as any;
            const parent = await prisma.moduleComment.findUnique({ where: { id: parentId }, select: { moduleId: true } });
            if (!parent || parent.moduleId !== moduleId) {
                return NextResponse.json({ error: "Invalid parent comment" }, { status: 400 });
            }
        }

        const prisma = db as any;
        const created = await prisma.moduleComment.create({
            data: {
                moduleId,
                authorId: session.user.id,
                content: text,
                parentId: parentId ?? null,
                isAdmin: !!session.user.isAdmin,
            },
            include: { author: { select: { id: true, name: true, image: true } } },
        });

        // Fire-and-forget Discord webhook notification if configured
        const webhook = process.env.DISCORD_WEBHOOK_URL;
        if (webhook) {
            // Best-effort, do not block response
            fetch(webhook, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: `💬 New comment on module ${moduleId} by ${created.author.name ?? "User"}:\n> ${text}`,
                }),
            }).catch(() => { });
        }

        return NextResponse.json(created, { status: 201 });
    } catch (err) {
        console.error("POST /comments error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
