import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// Schema kiểm tra CUID hợp lệ
const routeContextSchema = z.object({
  id: z.string().cuid(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: rawId } = await params;
  
  // 1. Validate ID bằng Zod
  const parsed = routeContextSchema.safeParse({ id: rawId });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid notification ID format" }, { status: 400 });
  }

  const id = parsed.data.id;

  // 2. Fetch và xử lý (giữ nguyên logic cũ của bạn)
  const notification = await db.notification.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!notification) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (notification.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await db.notification.update({
    where: { id },
    data: { read: true },
    select: { id: true, read: true },
  });

  return NextResponse.json(updated);
}