import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  const { searchParams } = new URL(req.url);
  const skip = parseInt(searchParams.get("skip") || "0");

  const notifications = await db.notification.findMany({
    where: { userId: session?.user?.id },
    orderBy: { createdAt: "desc" },
    take: 10,
    skip: skip,
  });

  return NextResponse.json(notifications);
}

export async function PATCH() {
  const session = await auth();
  await db.notification.updateMany({
    where: { userId: session?.user?.id, isRead: false },
    data: { isRead: true },
  });
  return NextResponse.json({ success: true });
}
