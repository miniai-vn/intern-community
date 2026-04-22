export type NotificationRealtimePayload = {
  id: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

type NotificationRecord = {
  id: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: Date;
};

function toRealtimePayload(notification: NotificationRecord): NotificationRealtimePayload {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    link: notification.link,
    isRead: notification.isRead,
    createdAt: notification.createdAt.toISOString(),
  };
}

export function emitNotificationToUser(userId: string, notification: NotificationRecord) {
  const io = (globalThis as { __io?: { to: (room: string) => { emit: (event: string, payload: NotificationRealtimePayload) => void } } }).__io;
  if (!io) return;

  io.to(`user:${userId}`).emit("notification:new", toRealtimePayload(notification));
}
