import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db as prisma } from "@/lib/db";

type NotificationFilter = "all" | "read" | "unread";

type CursorPayload = {
  createdAt: string;
  id: string;
};

function parseFilter(value: string | null): NotificationFilter {
  if (!value || value === "all") return "all";
  if (value === "read" || value === "unread") return value;
  throw new Error("Invalid filter value");
}

function parseTake(value: string | null): number {
  const parsed = Number(value ?? "10");
  if (!Number.isFinite(parsed) || parsed < 1) return 10;
  return Math.min(Math.floor(parsed), 50);
}

function encodeCursor(cursor: CursorPayload): string {
  return Buffer.from(JSON.stringify(cursor)).toString("base64url");
}

function decodeCursor(value: string | null): CursorPayload | null {
  if (!value) return null;

  try {
    const decoded = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    );
    if (
      typeof decoded?.createdAt !== "string" ||
      typeof decoded?.id !== "string"
    ) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

// GET /api/notifications
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;

  let filter: NotificationFilter;
  try {
    filter = parseFilter(searchParams.get("filter"));
  } catch {
    return NextResponse.json(
      { error: "filter must be one of: all, read, unread" },
      { status: 422 },
    );
  }

  const take = parseTake(searchParams.get("take"));
  const cursor = decodeCursor(searchParams.get("cursor"));

  const filterWhere = filter === "all" ? {} : { isRead: filter === "read" };

  const cursorWhere = cursor
    ? {
        OR: [
          { createdAt: { lt: new Date(cursor.createdAt) } },
          {
            createdAt: new Date(cursor.createdAt),
            id: { lt: cursor.id },
          },
        ],
      }
    : {};

  const notifications = await prisma.notification.findMany({
    where: {
      userId: session.user.id,
      ...filterWhere,
      ...cursorWhere,
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: take + 1,
  });

  const hasMore = notifications.length > take;
  const items = hasMore ? notifications.slice(0, take) : notifications;
  const last = hasMore ? items[items.length - 1] : null;

  return NextResponse.json({
    notifications: items,
    nextCursor: last
      ? encodeCursor({
          createdAt: last.createdAt.toISOString(),
          id: last.id,
        })
      : null,
  });
}
