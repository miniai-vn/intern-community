import type {
  MiniApp,
  Category,
  User,
  SubmissionStatus,
  Notification,
  NotificationType,
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

// AppNotification is the shape returned by GET /api/notifications.
// We extend the Prisma type with the minimal linked-module fields we select.
export type AppNotification = Pick<
  Notification,
  "id" | "type" | "message" | "read" | "createdAt" | "miniAppId"
> & {
  miniApp: { slug: string } | null;
};

export type { Category, User, NotificationType };
