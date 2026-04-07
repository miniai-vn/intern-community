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

  // Only updated by Owner
  const updated = await db.notification.updateMany({
    where: {
      id,
      userId: session.user.id,
    },
    data: { isRead: true },
  });

  return NextResponse.json({ success: true });
}