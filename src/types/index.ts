import type {
  MiniApp,
  Category,
  User,
  SubmissionStatus,
  Notification,
  Comment,
} from "@prisma/client";

// "Module" is the UI-facing term for a MiniApp DB record.
// The naming difference is intentional — keep it consistent.
export type Module = MiniApp & {
  category: Category;
  author: Pick<User, "id" | "name" | "image">;
  _count?: { votes: number };
  hasVoted?: boolean;
};

export type ModuleStatus = SubmissionStatus;

export type AppNotification = Notification;
export type ModuleComment = Comment & {
  author: Pick<User, "id" | "name" | "image">;
  replies?: ModuleComment[];
};

export type { Category, User };
