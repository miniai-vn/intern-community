import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    notification: {
      findMany: vi.fn(),
      count: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getNotificationsForUser } from "@/lib/notifications";
import {
  GET as getNotificationsRoute,
  PATCH as patchNotificationsRoute,
} from "@/app/api/notifications/route";
import { PATCH as patchNotificationByIdRoute } from "@/app/api/notifications/[id]/route";
import { GET as unreadCountRoute } from "@/app/api/notifications/unread-count/route";

type AuthMock = {
  mockResolvedValueOnce: (value: unknown) => unknown;
};

const mockedAuth = auth as unknown as AuthMock;
const mockedDb = db as unknown as {
  notification: {
    findMany: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
    updateMany: ReturnType<typeof vi.fn>;
  };
};

type AuthSession = { user: { id: string } };
const asAuthSession = (userId: string) => ({ user: { id: userId } }) as AuthSession;

const requestForByIdRoute = {} as Parameters<typeof patchNotificationByIdRoute>[0];

async function readJson(response: Response) {
  return response.json();
}

describe("notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps notification records to API-safe payload", async () => {
    mockedDb.notification.findMany.mockResolvedValueOnce([
      {
        id: "n1",
        message: "Pomodoro was approved",
        readAt: null,
        createdAt: new Date("2026-04-01T10:00:00.000Z"),
        type: "APPROVED",
        miniApp: { id: "m1", slug: "pomodoro", name: "Pomodoro" },
      },
      {
        id: "n2",
        message: "Expense Tracker was rejected",
        readAt: new Date("2026-04-01T10:05:00.000Z"),
        createdAt: new Date("2026-04-01T10:01:00.000Z"),
        type: "REJECTED",
        miniApp: { id: "m2", slug: "expense", name: "Expense Tracker" },
      },
    ]);
    mockedDb.notification.count.mockResolvedValueOnce(1);

    const result = await getNotificationsForUser("u1");

    expect(mockedDb.notification.findMany).toHaveBeenCalledWith({
      where: { userId: "u1" },
      include: { miniApp: { select: { id: true, slug: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });
    expect(mockedDb.notification.count).toHaveBeenCalledWith({
      where: { userId: "u1", readAt: null },
    });

    expect(result.unreadCount).toBe(1);
    expect(result.items[0]).toEqual({
      id: "n1",
      message: "Pomodoro was approved",
      readAt: null,
      createdAt: "2026-04-01T10:00:00.000Z",
      type: "APPROVED",
      miniApp: { id: "m1", slug: "pomodoro", name: "Pomodoro" },
    });
    expect(result.items[1].readAt).toBe("2026-04-01T10:05:00.000Z");
  });

  it("GET /api/notifications returns 401 when unauthenticated", async () => {
    mockedAuth.mockResolvedValueOnce(null);

    const response = await getNotificationsRoute();
    const body = await readJson(response);

    expect(response.status).toBe(401);
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("GET /api/notifications returns notifications payload for authenticated user", async () => {
    mockedAuth.mockResolvedValueOnce(asAuthSession("u1"));
    mockedDb.notification.findMany.mockResolvedValueOnce([
      {
        id: "n1",
        message: "Pomodoro was approved",
        readAt: null,
        createdAt: new Date("2026-04-01T10:00:00.000Z"),
        type: "APPROVED",
        miniApp: { id: "m1", slug: "pomodoro", name: "Pomodoro" },
      },
    ]);
    mockedDb.notification.count.mockResolvedValueOnce(1);

    const response = await getNotificationsRoute();
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body).toEqual({
      items: [
        {
          id: "n1",
          message: "Pomodoro was approved",
          readAt: null,
          createdAt: "2026-04-01T10:00:00.000Z",
          type: "APPROVED",
          miniApp: { id: "m1", slug: "pomodoro", name: "Pomodoro" },
        },
      ],
      unreadCount: 1,
    });
  });

  it("PATCH /api/notifications marks all unread notifications as read", async () => {
    mockedAuth.mockResolvedValueOnce(asAuthSession("u1"));
    mockedDb.notification.updateMany.mockResolvedValueOnce({ count: 3 });

    const response = await patchNotificationsRoute();
    const body = await readJson(response);

    expect(mockedDb.notification.updateMany).toHaveBeenCalledWith({
      where: { userId: "u1", readAt: null },
      data: { readAt: expect.any(Date) },
    });
    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true });
  });

  it("PATCH /api/notifications/[id] returns 401 when unauthenticated", async () => {
    mockedAuth.mockResolvedValueOnce(null);

    const response = await patchNotificationByIdRoute(requestForByIdRoute, {
      params: Promise.resolve({ id: "n1" }),
    });
    const body = await readJson(response);

    expect(response.status).toBe(401);
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("PATCH /api/notifications/[id] returns 404 when target notification is not found", async () => {
    mockedAuth.mockResolvedValueOnce(asAuthSession("u1"));
    mockedDb.notification.updateMany.mockResolvedValueOnce({ count: 0 });

    const response = await patchNotificationByIdRoute(requestForByIdRoute, {
      params: Promise.resolve({ id: "n1" }),
    });
    const body = await readJson(response);

    expect(response.status).toBe(404);
    expect(body).toEqual({ error: "Not found" });
  });

  it("PATCH /api/notifications/[id] marks one notification as read", async () => {
    mockedAuth.mockResolvedValueOnce(asAuthSession("u1"));
    mockedDb.notification.updateMany.mockResolvedValueOnce({ count: 1 });

    const response = await patchNotificationByIdRoute(requestForByIdRoute, {
      params: Promise.resolve({ id: "n1" }),
    });
    const body = await readJson(response);

    expect(mockedDb.notification.updateMany).toHaveBeenCalledWith({
      where: { id: "n1", userId: "u1", readAt: null },
      data: { readAt: expect.any(Date) },
    });
    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true });
  });

  it("GET /api/notifications/unread-count returns 0 for anonymous user", async () => {
    mockedAuth.mockResolvedValueOnce(null);

    const response = await unreadCountRoute();
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body).toEqual({ count: 0 });
  });

  it("GET /api/notifications/unread-count returns unread count for authenticated user", async () => {
    mockedAuth.mockResolvedValueOnce(asAuthSession("u1"));
    mockedDb.notification.count.mockResolvedValueOnce(4);

    const response = await unreadCountRoute();
    const body = await readJson(response);

    expect(mockedDb.notification.count).toHaveBeenCalledWith({
      where: { userId: "u1", readAt: null },
    });
    expect(response.status).toBe(200);
    expect(body).toEqual({ count: 4 });
  });
});
