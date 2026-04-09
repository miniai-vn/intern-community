import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mocks ─────────────────────────────────────────────────────────────────

// Mock auth — returns null by default (unauthenticated)
const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({ auth: () => mockAuth() }));

// Mock Prisma db
const mockDb = {
  rateLimitEvent: {
    count: vi.fn(),
    create: vi.fn(),
  },
  miniApp: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  vote: {
    findUnique: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
  $transaction: vi.fn(),
};
vi.mock("@/lib/db", () => ({ db: mockDb }));

// Helper to build a NextRequest-like object for the POST handler
function buildRequest(body?: unknown): Request {
  if (body === undefined) {
    // Simulate invalid JSON
    return new Request("http://localhost/api/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });
  }
  return new Request("http://localhost/api/votes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// Dynamically import the handler after mocks are set up
async function getHandler() {
  const mod = await import("@/app/api/votes/route");
  return mod.POST;
}

// ─── Tests ─────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  // Default: authenticated user
  mockAuth.mockResolvedValue({ user: { id: "user-1" } });
  // Default: rate limit passes
  mockDb.rateLimitEvent.count.mockResolvedValue(0);
  mockDb.rateLimitEvent.create.mockResolvedValue({});
  // Default: module exists and is APPROVED
  mockDb.miniApp.findUnique.mockResolvedValue({
    id: "mod-1",
    status: "APPROVED",
  });
});

describe("POST /api/votes", () => {
  // ── Auth ────────────────────────────────────────────────────────────────

  it("returns 401 when user is not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const POST = await getHandler();

    const res = await POST(buildRequest({ moduleId: "mod-1" }) as never);
    expect(res.status).toBe(401);

    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  // ── Validation ──────────────────────────────────────────────────────────

  it("returns 400 for invalid JSON body", async () => {
    const POST = await getHandler();

    const res = await POST(buildRequest(undefined) as never);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toContain("Invalid JSON");
  });

  it("returns 400 when moduleId is missing", async () => {
    const POST = await getHandler();

    const res = await POST(buildRequest({}) as never);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toContain("moduleId");
  });

  it("returns 400 when moduleId is not a string", async () => {
    const POST = await getHandler();

    const res = await POST(buildRequest({ moduleId: 123 }) as never);
    expect(res.status).toBe(400);
  });

  // ── Module validation ──────────────────────────────────────────────────

  it("returns 404 when module does not exist", async () => {
    mockDb.miniApp.findUnique.mockResolvedValue(null);
    const POST = await getHandler();

    const res = await POST(buildRequest({ moduleId: "nonexistent" }) as never);
    expect(res.status).toBe(404);

    const data = await res.json();
    expect(data.error).toContain("not found");
  });

  it("returns 403 when module is not APPROVED", async () => {
    mockDb.miniApp.findUnique.mockResolvedValue({
      id: "mod-1",
      status: "PENDING",
    });
    const POST = await getHandler();

    const res = await POST(buildRequest({ moduleId: "mod-1" }) as never);
    expect(res.status).toBe(403);

    const data = await res.json();
    expect(data.error).toContain("approved");
  });

  // ── Rate limiting ──────────────────────────────────────────────────────

  it("returns 429 when rate limit is exceeded", async () => {
    mockDb.rateLimitEvent.count.mockResolvedValue(10);
    const POST = await getHandler();

    const res = await POST(buildRequest({ moduleId: "mod-1" }) as never);
    expect(res.status).toBe(429);

    const data = await res.json();
    expect(data.error).toContain("Too many votes");
  });

  it("allows request when under rate limit", async () => {
    mockDb.rateLimitEvent.count.mockResolvedValue(5);
    mockDb.vote.findUnique.mockResolvedValue(null);
    mockDb.$transaction.mockResolvedValue([]);
    const POST = await getHandler();

    const res = await POST(buildRequest({ moduleId: "mod-1" }) as never);
    expect(res.status).toBe(200);
    expect(mockDb.rateLimitEvent.create).toHaveBeenCalled();
  });

  // ── Vote / Unvote ─────────────────────────────────────────────────────

  it("creates a vote when user has not voted", async () => {
    mockDb.vote.findUnique.mockResolvedValue(null);
    mockDb.$transaction.mockResolvedValue([]);
    const POST = await getHandler();

    const res = await POST(buildRequest({ moduleId: "mod-1" }) as never);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.voted).toBe(true);
    expect(mockDb.$transaction).toHaveBeenCalled();
  });

  it("removes a vote when user has already voted", async () => {
    mockDb.vote.findUnique.mockResolvedValue({ id: "vote-1" });
    mockDb.$transaction.mockResolvedValue([]);
    const POST = await getHandler();

    const res = await POST(buildRequest({ moduleId: "mod-1" }) as never);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.voted).toBe(false);
    expect(mockDb.$transaction).toHaveBeenCalled();
  });

  // ── Concurrency (P2002 unique constraint race) ────────────────────────

  it("handles P2002 unique constraint race gracefully", async () => {
    mockDb.vote.findUnique.mockResolvedValue(null);
    mockDb.$transaction.mockRejectedValue({ code: "P2002" });
    const POST = await getHandler();

    const res = await POST(buildRequest({ moduleId: "mod-1" }) as never);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.voted).toBe(true);
  });

  it("re-throws non-P2002 errors", async () => {
    mockDb.vote.findUnique.mockResolvedValue(null);
    mockDb.$transaction.mockRejectedValue(new Error("DB connection lost"));
    const POST = await getHandler();

    await expect(
      POST(buildRequest({ moduleId: "mod-1" }) as never)
    ).rejects.toThrow("DB connection lost");
  });
});
