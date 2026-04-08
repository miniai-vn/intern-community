import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.update({
    where: { id: session.user.id },
    data: { isAdmin: true },
  });

  return NextResponse.json({ success: true, user: { id: user.id, isAdmin: user.isAdmin } });
}
