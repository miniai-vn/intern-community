import type { MiniApp, Category, User, SubmissionStatus } from "@prisma/client";

// "Module" is the UI-facing term for a MiniApp DB record.
// The naming difference is intentional — keep it consistent.
export type Module = MiniApp & {
  category: Category;
  author: Pick<User, "id" | "name" | "image">;
  _count?: { votes: number };
  hasVoted?: boolean;
};

export type ModuleStatus = SubmissionStatus;

export type { Category, User };

export type CommunityStats = {
  totalModules: number;
  byStatus: {
    status: SubmissionStatus;
    _count: number;
  }[];
  topCategories: {
    category: { name: string; slug: string };
    _count: number;
  }[];
};
