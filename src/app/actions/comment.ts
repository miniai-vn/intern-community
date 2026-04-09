"use server";

import { revalidatePath } from "next/cache";
// Note: Adjust the import paths below based on the repo's actual structure 
// (e.g., "@/lib/prisma" or "@/lib/db")
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth"; // Adjust to your NextAuth v5 config export

const prisma = new PrismaClient();

export async function createComment(formData: FormData) {
    try{
  const session = await auth();
  
  const content = formData.get("content") as string;
  const miniAppId = formData.get("miniAppId") as string;
  let authorName = formData.get("authorName") as string | null;

  if (!content || !miniAppId) {
    throw new Error("Comment content and Module ID are required.");
  }

  // If there's no session and no provided name, default to "Anonymous"
  if (!session && !authorName) {
    authorName = "Anonymous";
  }

  await prisma.comment.create({
    data: {
      content,
      miniAppId,
      userId: session?.user?.id || null, // Will be null if anonymous
      authorName: session?.user?.name ? null : authorName, 
    },
  });

  // Refresh the page data automatically
  revalidatePath(`/module/${miniAppId}`); 
}catch(error){
    console.error("CREATE COMMENT ERROR:", error);
    throw error;
}
}