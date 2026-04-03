import { describe, it, expect, beforeEach, vi } from "vitest";
import { db } from "@/lib/db";
import * as authLib from "@/lib/auth";

// Mock auth and db
vi.mock("@/lib/auth");
vi.mock("@/lib/db");

describe("Notification API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/notifications", () => {
    it("should return 401 if not authenticated", async () => {
      vi.mocked(authLib.auth).mockResolvedValue(null);

      const result = await import("@/app/api/notifications/route").then(
        (m) => m.GET()
      );
      const json = await result.json();

      expect(result.status).toBe(401);
      expect(json.error).toBe("Unauthorized");
    });

    it("should return notifications for authenticated user", async () => {
      const mockSession = {
        user: { id: "user-123", name: "Test User", email: "test@example.com" },
      };
      const mockNotifications = [
        {
          id: "notif-1",
          userId: "user-123",
          moduleId: "module-1",
          message: "Module A was approved",
          isRead: false,
          createdAt: new Date(),
          module: { id: "module-1", name: "Module A", slug: "module-a" },
        },
      ];

      vi.mocked(authLib.auth).mockResolvedValue(mockSession);
      vi.mocked(db.notification.findMany).mockResolvedValue(
        mockNotifications as any
      );

      const result = await import("@/app/api/notifications/route").then(
        (m) => m.GET()
      );
      const json = await result.json();

      expect(result.status).toBe(200);
      expect(json.notifications).toHaveLength(1);
      expect(json.unreadCount).toBe(1);
    });

    it("should filter unread notifications correctly", async () => {
      const mockSession = { user: { id: "user-123" } };
      const mockNotifications = [
        {
          id: "notif-1",
          message: "Module A was approved",
          isRead: false,
        },
        {
          id: "notif-2",
          message: "Module B was rejected",
          isRead: true,
        },
      ] as any;

      vi.mocked(authLib.auth).mockResolvedValue(mockSession as any);
      vi.mocked(db.notification.findMany).mockResolvedValue(
        mockNotifications
      );

      const result = await import("@/app/api/notifications/route").then(
        (m) => m.GET()
      );
      const json = await result.json();

      expect(json.unreadCount).toBe(1);
    });
  });

  describe("PATCH /api/notifications/[id]", () => {
    it("should return 401 if not authenticated", async () => {
      vi.mocked(authLib.auth).mockResolvedValue(null);

      const result = await import(
        "@/app/api/notifications/[id]/route"
      ).then((m) =>
        m.PATCH(new Request("http://localhost/api/notifications/notif-1"), {
          params: Promise.resolve({ id: "notif-1" }),
        })
      );
      const json = await result.json();

      expect(result.status).toBe(401);
    });

    it("should mark notification as read", async () => {
      const mockSession = { user: { id: "user-123" } };
      const mockNotification = {
        id: "notif-1",
        userId: "user-123",
        isRead: false,
      };

      vi.mocked(authLib.auth).mockResolvedValue(mockSession as any);
      vi.mocked(db.notification.findFirst).mockResolvedValue(
        mockNotification as any
      );
      vi.mocked(db.notification.update).mockResolvedValue({
        ...mockNotification,
        isRead: true,
      } as any);

      const result = await import(
        "@/app/api/notifications/[id]/route"
      ).then((m) =>
        m.PATCH(new Request("http://localhost/api/notifications/notif-1"), {
          params: Promise.resolve({ id: "notif-1" }),
        })
      );
      const json = await result.json();

      expect(result.status).toBe(200);
      expect(json.success).toBe(true);
    });

    it("should return 404 if notification not found", async () => {
      const mockSession = { user: { id: "user-123" } };

      vi.mocked(authLib.auth).mockResolvedValue(mockSession as any);
      vi.mocked(db.notification.findFirst).mockResolvedValue(null);

      const result = await import(
        "@/app/api/notifications/[id]/route"
      ).then((m) =>
        m.PATCH(new Request("http://localhost/api/notifications/notif-1"), {
          params: Promise.resolve({ id: "notif-1" }),
        })
      );
      const json = await result.json();

      expect(result.status).toBe(404);
      expect(json.error).toBe("Notification not found");
    });
  });
});
