import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const result = await db.notification.updateMany({
    where: { id, userId: session.user.id, readAt: null },
    data: { readAt: new Date() },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}