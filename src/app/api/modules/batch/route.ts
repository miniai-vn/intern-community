import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { batchReviewSchema } from "@/lib/validations";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = batchReviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
    }

    const { ids, status, feedback, reviewerNote } = parsed.data;

    // Use a transaction if we need multiple operations, 
    // but updateMany is enough for uniform status updates.
    const result = await db.miniApp.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        status,
        feedback: feedback || undefined,
        reviewerNote: reviewerNote || undefined,
      },
    });

    return NextResponse.json({ 
      message: `Successfully updated ${result.count} modules`,
      count: result.count 
    });
  } catch (error) {
    console.error("Batch API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
