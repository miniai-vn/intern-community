import type { MiniApp, Category, User, SubmissionStatus, Comment } from "@prisma/client";

// "Module" is the UI-facing term for a MiniApp DB record.
// The naming difference is intentional — keep it consistent.
export type Module = MiniApp & {
  category: Category;
  author: Pick<User, "id" | "name" | "image">;
  _count?: { votes: number; comments: number

  };
  hasVoted?: boolean;
};

export type ModuleStatus = SubmissionStatus;
export type Params = { params: Promise<{ id: string }> };
export type { Category, User, Comment };
