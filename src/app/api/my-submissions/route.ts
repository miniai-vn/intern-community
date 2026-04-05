import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/my-submissions — returns the current user's submissions
export async function GET() {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const submissions = await db.miniApp.findMany({
        where: { authorId: session.user.id },
        include: { category: true },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(submissions);
}
