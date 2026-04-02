import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/dist/server/web/spec-extension/response";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ count: 0 }, { status: 401 });

  const count = await db.notification.count({
    where: { userId: session.user.id, isRead: false },
  });
  return NextResponse.json({ count });
}
