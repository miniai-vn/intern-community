"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { submitModuleSchema } from "@/lib/validations";
import { checkLinkSafety } from "@/lib/safety";
import { Prisma } from "@prisma/client";
import slugify from "slugify";

export async function submitModule(formData: FormData) {

  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized. Please sign in to submit a module." };
  }


  const lastSubmission = await db.miniApp.findFirst({
    where: { authorId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  if (lastSubmission) {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (lastSubmission.createdAt > fiveMinutesAgo) {
      return { 
        error: "Rate limit exceeded. Please wait 5 minutes between submissions." 
      };
    }
  }


  const rawData = Object.fromEntries(formData.entries());
  const validatedData = submitModuleSchema.safeParse(rawData);

  if (!validatedData.success) {
    return { 
      error: validatedData.error.issues[0]?.message || "Invalid submission data." 
    };
  }

  const { name, description, demoUrl, repoUrl, categoryId } = validatedData.data;


  if (demoUrl) {
    const safetyResult = await checkLinkSafety(demoUrl);
    if (!safetyResult.isSafe) {
      return { 
        error: `Security Alert: This link is flagged as ${safetyResult.threatType}. Submission blocked.` 
      };
    }
  }


  try {

    const slug = slugify(name, { lower: true, strict: true });

    const newModule = await db.miniApp.create({
      data: {
        name,
        slug,
        description,
        repoUrl,
        demoUrl: demoUrl || null,
        categoryId,
        authorId: session.user.id,
        status: "PENDING", 
      },
    });

    return { success: true, id: newModule.id };
  } catch (error: unknown) {
    console.error("Database Persistence Error:", error);

    // Handle Unique Constraint Violation (Prisma Error P2002)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return { 
          error: "A module with this name already exists. Please choose a unique name." 
        };
      }
    }

    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: "An unexpected error occurred while saving your module." };
  }
}