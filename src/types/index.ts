import type {
  MiniApp,
  Category,
  User,
  SubmissionStatus,
  ModuleRevision,
} from "@prisma/client";

export type ModuleRevisionWithCategory = ModuleRevision & {
  category: Pick<Category, "id" | "name" | "slug">;
};

// "Module" is the UI-facing term for a MiniApp DB record.
// The naming difference is intentional — keep it consistent.
export type Module = MiniApp & {
  category: Category;
  author: Pick<User, "id" | "name" | "image">;
  revisions?: ModuleRevisionWithCategory[];
  _count?: { votes?: number; revisions?: number };
  hasVoted?: boolean;
};

export type ModuleStatus = SubmissionStatus;

export type { Category, User };
