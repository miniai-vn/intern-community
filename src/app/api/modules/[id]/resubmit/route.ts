import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { moduleResubmitSchema } from "@/lib/validations";
import {
  buildRevisionSnapshot,
  canAuthorResubmit,
  isAuthorOwner,
} from "@/lib/module-workflow";

type Params = { params: Promise<{ id: string }> };

// POST /api/modules/[id]/resubmit — author updates rejected submission and resubmits
export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = moduleResubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { id } = await params;
  const miniApp = await db.miniApp.findUnique({ where: { id } });
  if (!miniApp) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!isAuthorOwner(session.user.id, miniApp.authorId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!canAuthorResubmit(miniApp.status)) {
    return NextResponse.json(
      { error: "Only rejected submissions can be revised and resubmitted." },
      { status: 409 }
    );
  }

  const revisionWrite = db.moduleRevision.create({
    data: {
      moduleId: miniApp.id,
      ...buildRevisionSnapshot(miniApp),
    },
  });

  const moduleWrite = db.miniApp.update({
    where: { id: miniApp.id },
    data: {
      ...parsed.data,
      status: "PENDING",
      feedback: null,
    },
    include: {
      category: true,
      author: { select: { id: true, name: true, image: true } },
    },
  });

  const [, updated] = await db.$transaction([revisionWrite, moduleWrite]);

  return NextResponse.json(updated);
}
