import type { MiniApp, Category, User, SubmissionStatus, Comment as PrismaComment } from "@prisma/client";

// "Module" is the UI-facing term for a MiniApp DB record.
// The naming difference is intentional — keep it consistent.
export type Module = MiniApp & {
  category: Category;
  author: Pick<User, "id" | "name" | "image">;
  _count?: { votes: number };
  hasVoted?: boolean;
};

export type ModuleStatus = SubmissionStatus;

// Comment type - uses Prisma's generated type when available
export type Comment = PrismaComment;

// Comment with author info for display
export type CommentWithAuthor = Comment & {
  author: Pick<User, "id" | "name" | "image">;
  replies?: CommentWithAuthor[];
};

export type { Category, User };
