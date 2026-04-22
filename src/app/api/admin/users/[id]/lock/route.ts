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

  if (id === session.user.id && body.isLocked) {
    return NextResponse.json(
      { error: "You cannot lock your own account." },
      { status: 400 },
    );
  }

  const user = await db.user.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await db.user.update({
    where: { id },
    data: { isLocked: body.isLocked },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      isAdmin: true,
      isLocked: true,
    },
  });

  return NextResponse.json(updated);
}
