export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export const mockNotifications: NotificationItem[] = [
  {
    id: "noti-001",
    title: "Submission update",
    message: "Pomodoro Timer was approved.",
    isRead: false,
    createdAt: "2026-04-08T10:15:00.000Z",
  },
  {
    id: "noti-002",
    title: "Submission update",
    message:
      "Task Prioritizer was rejected. Please review feedback and resubmit.",
    isRead: false,
    createdAt: "2026-04-08T09:20:00.000Z",
  },
  {
    id: "noti-003",
    title: "Submission update",
    message: "Markdown Snippet Builder was approved.",
    isRead: true,
    createdAt: "2026-04-08T06:45:00.000Z",
  },
  {
    id: "noti-004",
    title: "Submission update",
    message: "Git Branch Visualizer was approved.",
    isRead: true,
    createdAt: "2026-04-07T23:30:00.000Z",
  },
  {
    id: "noti-005",
    title: "Submission update",
    message:
      "Regex Playground was rejected. Add validation details and submit again.",
    isRead: false,
    createdAt: "2026-04-07T18:10:00.000Z",
  },
  {
    id: "noti-006",
    title: "Submission update",
    message: "Sprint Notes Assistant was approved.",
    isRead: true,
    createdAt: "2026-04-06T14:00:00.000Z",
  },
  {
    id: "noti-007",
    title: "Submission update",
    message: "Release Checklist Generator was approved.",
    isRead: false,
    createdAt: "2026-04-06T08:25:00.000Z",
  },
  {
    id: "noti-008",
    title: "Submission update",
    message:
      "Kanban Snapshot Exporter was rejected due to an invalid demo URL.",
    isRead: true,
    createdAt: "2026-04-05T21:40:00.000Z",
  },
  {
    id: "noti-009",
    title: "Submission update",
    message: "Commit Message Coach was approved.",
    isRead: false,
    createdAt: "2026-04-05T12:05:00.000Z",
  },
  {
    id: "noti-010",
    title: "Submission update",
    message: "API Mock Builder was approved.",
    isRead: true,
    createdAt: "2026-04-04T16:30:00.000Z",
  },
];
