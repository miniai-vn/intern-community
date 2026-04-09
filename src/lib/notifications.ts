import { db } from "@/lib/db";

export async function createNotification({
  userId,
  title,
  message,
  type,
  moduleId,
}: {
  userId: string;
  title: string;
  message: string;
  type: string;
  moduleId?: string;
}) {
  try {
    const notification = await db.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        moduleId,
      },
    });

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

export async function createStatusChangeNotification(
  userId: string,
  moduleStatus: "APPROVED" | "REJECTED",
  moduleName: string,
  moduleId: string,
  feedback?: string
) {
  const title = moduleStatus === "APPROVED" ? "Module Approved!" : "Module Rejected";
  
  let message = `Module "${moduleName}" has been ${moduleStatus.toLowerCase()}`;
  if (feedback) {
    message += `. Feedback: ${feedback}`;
  }

  return createNotification({
    userId,
    title,
    message,
    type: moduleStatus,
    moduleId,
  });
}
