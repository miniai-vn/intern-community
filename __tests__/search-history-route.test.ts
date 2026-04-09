import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock auth ─────────────────────────────────────────────────────────────
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

// ─── Mock db ───────────────────────────────────────────────────────────────
vi.mock("@/lib/db", () => ({
  db: {
    searchHistory: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { GET, POST, DELETE } from "@/app/api/search-history/route";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockAuth = vi.mocked(auth) as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSearchHistory = db.searchHistory as any;

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/search-history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ============================================================
// GET /api/search-history
// ============================================================
describe("GET /api/search-history", () => {
  it("returns 401 if not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns search history for authenticated user", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user1" } });
    const historyData = [
      { id: "h1", query: "react", createdAt: new Date() },
      { id: "h2", query: "vue", createdAt: new Date() },
    ];
    mockSearchHistory.findMany.mockResolvedValue(historyData);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(2);
    expect(data[0].query).toBe("react");
    expect(mockSearchHistory.findMany).toHaveBeenCalledWith({
      where: { userId: "user1" },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, query: true, createdAt: true },
    });
  });
});

// ============================================================
// POST /api/search-history
// ============================================================
describe("POST /api/search-history", () => {
  it("returns 401 if not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await POST(makeRequest({ query: "test" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 if query is missing", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user1" } });
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it("returns 400 if query is not a string", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user1" } });
    const res = await POST(makeRequest({ query: 123 }));
    expect(res.status).toBe(400);
  });

  it("returns 400 if query is empty after trim", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user1" } });
    const res = await POST(makeRequest({ query: "   " }));
    expect(res.status).toBe(400);
  });

  it("returns 400 if query exceeds 200 chars", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user1" } });
    const res = await POST(makeRequest({ query: "a".repeat(201) }));
    expect(res.status).toBe(400);
  });

  it("updates timestamp if duplicate query exists", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user1" } });
    mockSearchHistory.findFirst.mockResolvedValue({ id: "existing1" });

    const res = await POST(makeRequest({ query: "react" }));
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.success).toBe(true);
    expect(mockSearchHistory.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "existing1" } }),
    );
    expect(mockSearchHistory.create).not.toHaveBeenCalled();
  });

  it("creates new entry if no duplicate exists", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user1" } });
    mockSearchHistory.findFirst.mockResolvedValue(null);
    mockSearchHistory.findMany.mockResolvedValue(
      Array.from({ length: 5 }, (_, i) => ({ id: `h${i}` })),
    );

    const res = await POST(makeRequest({ query: "nextjs" }));
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.success).toBe(true);
    expect(mockSearchHistory.create).toHaveBeenCalledWith({
      data: { userId: "user1", query: "nextjs" },
    });
  });

  it("enforces 20-item limit by deleting oldest", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user1" } });
    mockSearchHistory.findFirst.mockResolvedValue(null);
    // 21 items after creation → should delete the 21st
    const items = Array.from({ length: 21 }, (_, i) => ({ id: `h${i}` }));
    mockSearchHistory.findMany.mockResolvedValue(items);

    await POST(makeRequest({ query: "overflow" }));

    expect(mockSearchHistory.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ["h20"] } },
    });
  });
});

// ============================================================
// DELETE /api/search-history
// ============================================================
describe("DELETE /api/search-history", () => {
  it("returns 401 if not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await DELETE();
    expect(res.status).toBe(401);
  });

  it("clears all history for authenticated user", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user1" } });
    mockSearchHistory.deleteMany.mockResolvedValue({ count: 5 });

    const res = await DELETE();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockSearchHistory.deleteMany).toHaveBeenCalledWith({
      where: { userId: "user1" },
    });
  });
});
