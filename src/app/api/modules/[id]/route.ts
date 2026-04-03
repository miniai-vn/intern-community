import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminPatchSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

// GET /api/modules/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const module = await db.miniApp.findUnique({
    where: { id },
    include: {
      category: true,
      author: { select: { id: true, name: true, image: true } },
      _count: { select: { votes: true } },
    },
  });
  if (!module) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(module);
}

// PATCH /api/modules/[id] — admin approve/reject (RFC 6902 JSON Patch)
//
// Content-Type: application/json-patch+json
//
// Supported operations:
//   { "op": "replace", "path": "/status",   "value": "APPROVED" | "REJECTED" }
//   { "op": "replace", "path": "/feedback", "value": "<string max 500>" }
//   { "op": "remove",  "path": "/feedback" }
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json-patch+json")) {
    return NextResponse.json(
      { error: "Content-Type must be application/json-patch+json" },
      { status: 415 },
    );
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = adminPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  // Reduce the patch operations into a Prisma update payload.
  const data: { status?: "APPROVED" | "REJECTED"; feedback?: string | null } = {};
  for (const op of parsed.data) {
    if (op.path === "/status" && op.op === "replace") {
      data.status = op.value;
    } else if (op.path === "/feedback" && op.op === "replace") {
      data.feedback = op.value;
    } else if (op.path === "/feedback" && op.op === "remove") {
      data.feedback = null;
    }
  }

  const updated = await db.miniApp.update({ where: { id }, data });
  return NextResponse.json(updated);
}

// DELETE /api/modules/[id] — author or admin can delete their own submission
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const module = await db.miniApp.findUnique({ where: { id } });
  if (!module) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (module.authorId !== session.user.id && !session.user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.miniApp.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
