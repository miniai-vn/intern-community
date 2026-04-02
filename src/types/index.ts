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

export type NotificationItem = {
  id: string;
  message: string;
  readAt: string | null;
  createdAt: string;
  type: "APPROVED" | "REJECTED";
  miniApp: {
    id: string;
    slug: string;
    name: string;
  };
};

export type NotificationsResponse = {
  items: NotificationItem[];
  unreadCount: number;
};

export type { Category, User };
