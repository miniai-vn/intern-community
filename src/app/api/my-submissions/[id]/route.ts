import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { submitModuleSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: { _: ["Unauthorized"] } },
                { status: 401 }
            );
        }

        const { id } = await params;
        const body = await req.json();

        const parsed = submitModuleSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.flatten().fieldErrors },
                { status: 422 }
            );
        }

        const existingSubmission = await db.miniApp.findFirst({
            where: {
                id,
                authorId: session.user.id,
            },
        });

        if (!existingSubmission) {
            return NextResponse.json(
                { error: { _: ["Submission not found"] } },
                { status: 404 }
            );
        }

        if (existingSubmission.status !== "PENDING") {
            return NextResponse.json(
                { error: { _: ["Only pending submissions can be edited"] } },
                { status: 403 }
            );
        }

        const { name, description, categoryId, repoUrl, demoUrl } = parsed.data;

        const updatedSubmission = await db.miniApp.update({
            where: { id },
            data: {
                name,
                description,
                categoryId,
                repoUrl,
                demoUrl: demoUrl || null,
            },
        });

        return NextResponse.json(updatedSubmission);
    } catch (error) {
        console.error("PATCH /api/my-submissions/[id] error:", error);
        return NextResponse.json(
            { error: { _: ["Failed to update submission"] } },
            { status: 500 }
        );
    }
}