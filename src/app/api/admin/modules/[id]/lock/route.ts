import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  if (typeof body?.isLocked !== "boolean") {
    return NextResponse.json(
      { error: "isLocked(boolean) is required" },
      { status: 400 },
    );
  }

  const module = await db.miniApp.findUnique({ where: { id } });
  if (!module) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await db.miniApp.update({
    where: { id },
    data: { isLocked: body.isLocked },
  });

  return NextResponse.json(updated);
}
