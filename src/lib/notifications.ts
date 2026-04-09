import type { NotificationType, SubmissionStatus } from "@prisma/client";
import { db } from "@/lib/db";

const statusNotificationMap: Record<
  Extract<SubmissionStatus, "APPROVED" | "REJECTED">,
  { type: NotificationType; verb: string }
> = {
  APPROVED: {
    type: "SUBMISSION_APPROVED",
    verb: "approved",
  },
  REJECTED: {
    type: "SUBMISSION_REJECTED",
    verb: "rejected",
  },
};

export function isNotifiableSubmissionStatus(
  status: SubmissionStatus
): status is Extract<SubmissionStatus, "APPROVED" | "REJECTED"> {
  return status === "APPROVED" || status === "REJECTED";
}

export function getSubmissionStatusNotificationData(
  status: Extract<SubmissionStatus, "APPROVED" | "REJECTED">
) {
  return statusNotificationMap[status];
}

export async function createSubmissionStatusNotification(input: {
  userId: string;
  moduleId: string;
  moduleName: string;
  status: Extract<SubmissionStatus, "APPROVED" | "REJECTED">;
}) {
  const config = statusNotificationMap[input.status];

  return db.notification.create({
    data: {
      userId: input.userId,
      moduleId: input.moduleId,
      type: config.type,
      message: `${input.moduleName} was ${config.verb}`,
    },
  });
}
