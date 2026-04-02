import type { SubmissionStatus } from "@prisma/client";

export type ModuleSnapshotSource = {
  name: string;
  description: string;
  repoUrl: string;
  demoUrl: string | null;
  status: SubmissionStatus;
  categoryId: string;
};

export function canAuthorResubmit(status: SubmissionStatus): boolean {
  return status === "REJECTED";
}

export function isAuthorOwner(actorUserId: string, authorId: string): boolean {
  return actorUserId === authorId;
}

export function buildRevisionSnapshot(module: ModuleSnapshotSource) {
  return {
    name: module.name,
    description: module.description,
    repoUrl: module.repoUrl,
    demoUrl: module.demoUrl,
    status: module.status,
    categoryId: module.categoryId,
  };
}
