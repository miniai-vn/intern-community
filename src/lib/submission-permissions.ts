import type { SubmissionStatus } from "@prisma/client";

interface CanDeleteModuleArgs {
  isAdmin: boolean;
  isOwner: boolean;
  status: SubmissionStatus;
}

export function canDeleteModule({
  isAdmin,
  isOwner,
  status,
}: CanDeleteModuleArgs): boolean {
  if (isAdmin) return true;
  if (!isOwner) return false;
  return status === "PENDING";
}