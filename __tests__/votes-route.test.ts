import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ─── Mocks ─────────────────────────────────────────────────────────────────

const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({ auth: () => mockAuth() }));

const mockDb = vi.hoisted(() => ({
  rateLimitEvent: {
    count: vi.fn(),
    create: vi.fn(),
    findFirst: vi.fn(),
    deleteMany: vi.fn(),
  },
  miniApp: { findUnique: vi.fn(), update: vi.fn() },
  vote: {
    findUnique: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
  $transaction: vi.fn(),
}));
vi.mock("@/lib/db", () => ({ db: mockDb }));

// Mock Prisma error class
vi.mock("@prisma/client", () => ({
  Prisma: {
    PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {
      code: string;
      clientVersion: string;
      constructor(
        message: string,
        { code, clientVersion }: { code: string; clientVersion?: string },
      ) {
        super(message);
        this.code = code;
        this.clientVersion = clientVersion ?? "0.0.0";
        this.name = "PrismaClientKnownRequestError";
      }
    },
  },
}));

import { POST } from "@/app/api/votes/route";
import { Prisma } from "@prisma/client";

// ─── Helpers ───────────────────────────────────────────────────────────────

function makeRequest(body?: unknown): NextRequest {
  if (body !== undefined) {
    return new NextRequest("http://localhost:3000/api/votes", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
  }
  return new NextRequest("http://localhost:3000/api/votes", {
    method: "POST",
  });
}

function makeInvalidJsonRequest(): NextRequest {
  return new NextRequest("http://localhost:3000/api/votes", {
    method: "POST",
    body: "not-json{{{",
    headers: { "Content-Type": "application/json" },
  });
}

const USER = {
  id: "user-1",
  name: "Test",
  email: "test@test.com",
  image: null,
  isAdmin: false,
};
const SESSION = { user: USER };

// ─── Setup ─────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  // Default: authenticated, rate limit OK, module exists and approved
  mockAuth.mockResolvedValue(SESSION);
  mockDb.rateLimitEvent.count.mockResolvedValue(0);
  mockDb.rateLimitEvent.create.mockResolvedValue({});
  mockDb.rateLimitEvent.findFirst.mockResolvedValue(null);
  mockDb.rateLimitEvent.deleteMany.mockResolvedValue({ count: 0 });
  mockDb.miniApp.findUnique.mockResolvedValue({
    id: "mod-1",
    status: "APPROVED",
  });
  mockDb.vote.deleteMany.mockResolvedValue({ count: 0 });
  mockDb.$transaction.mockResolvedValue([]);
  // Disable probabilistic cleanup in tests
  vi.spyOn(Math, "random").mockReturnValue(0.5);
});

// ─── Tests ─────────────────────────────────────────────────────────────────

describe("POST /api/votes", () => {
  // ── 401 Unauthorized ──────────────────────────────────────────────────

  describe("authentication", () => {
    it("returns 401 when not authenticated", async () => {
      mockAuth.mockResolvedValue(null);
      const res = await POST(makeRequest({ moduleId: "mod-1" }));
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Unauthorized");
    });

    it("returns 401 when session has no user", async () => {
      mockAuth.mockResolvedValue({ user: null });
      const res = await POST(makeRequest({ moduleId: "mod-1" }));
      expect(res.status).toBe(401);
    });
  });

  // ── 400 Bad Request ───────────────────────────────────────────────────

  describe("validation", () => {
    it("returns 400 for invalid JSON body", async () => {
      const res = await POST(makeInvalidJsonRequest());
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain("Invalid JSON");
    });

    it("returns 400 when moduleId is missing", async () => {
      const res = await POST(makeRequest({}));
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain("moduleId");
    });

    it("returns 400 when moduleId is not a string", async () => {
      const res = await POST(makeRequest({ moduleId: 123 }));
      expect(res.status).toBe(400);
    });

    it("returns 400 when moduleId is an empty string", async () => {
      const res = await POST(makeRequest({ moduleId: "" }));
      expect(res.status).toBe(400);
    });
  });

  // ── 404 Not Found ────────────────────────────────────────────────────

  describe("module lookup", () => {
    it("returns 404 when module does not exist", async () => {
      mockDb.miniApp.findUnique.mockResolvedValue(null);
      const res = await POST(makeRequest({ moduleId: "nonexistent" }));
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toContain("not found");
    });
  });

  // ── 403 Forbidden ────────────────────────────────────────────────────

  describe("business rules", () => {
    it("returns 403 when module is PENDING", async () => {
      mockDb.miniApp.findUnique.mockResolvedValue({
        id: "mod-1",
        status: "PENDING",
      });
      const res = await POST(makeRequest({ moduleId: "mod-1" }));
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toContain("approved");
    });

    it("returns 403 when module is REJECTED", async () => {
      mockDb.miniApp.findUnique.mockResolvedValue({
        id: "mod-1",
        status: "REJECTED",
      });
      const res = await POST(makeRequest({ moduleId: "mod-1" }));
      expect(res.status).toBe(403);
    });
  });

  // ── 429 Rate Limit ───────────────────────────────────────────────────

  describe("rate limiting", () => {
    it("returns 429 when rate limit is exceeded (10+ votes in window)", async () => {
      mockDb.rateLimitEvent.count.mockResolvedValue(10);
      mockDb.rateLimitEvent.findFirst.mockResolvedValue({
        createdAt: new Date(Date.now() - 30_000),
      });
      const res = await POST(makeRequest({ moduleId: "mod-1" }));
      expect(res.status).toBe(429);
      const json = await res.json();
      expect(json.error).toContain("Too many votes");
    });

    it("includes Retry-After header in 429 response", async () => {
      mockDb.rateLimitEvent.count.mockResolvedValue(10);
      mockDb.rateLimitEvent.findFirst.mockResolvedValue({
        createdAt: new Date(Date.now() - 30_000),
      });
      const res = await POST(makeRequest({ moduleId: "mod-1" }));
      expect(res.status).toBe(429);
      const retryAfter = res.headers.get("Retry-After");
      expect(retryAfter).toBeTruthy();
      expect(Number(retryAfter)).toBeGreaterThan(0);
    });

    it("allows request when under rate limit", async () => {
      mockDb.rateLimitEvent.count.mockResolvedValue(9);
      const res = await POST(makeRequest({ moduleId: "mod-1" }));
      expect(res.status).toBe(200);
    });

    it("records a rate limit event on allowed request", async () => {
      mockDb.rateLimitEvent.count.mockResolvedValue(0);
      await POST(makeRequest({ moduleId: "mod-1" }));
      expect(mockDb.rateLimitEvent.create).toHaveBeenCalledWith({
        data: { userId: "user-1", action: "vote" },
      });
    });

    it("does NOT record a rate limit event when limit exceeded", async () => {
      mockDb.rateLimitEvent.count.mockResolvedValue(10);
      mockDb.rateLimitEvent.findFirst.mockResolvedValue({
        createdAt: new Date(Date.now() - 30_000),
      });
      await POST(makeRequest({ moduleId: "mod-1" }));
      expect(mockDb.rateLimitEvent.create).not.toHaveBeenCalled();
    });

    it("triggers probabilistic cleanup of stale events", async () => {
      vi.spyOn(Math, "random").mockReturnValue(0.05); // < 0.1 threshold
      mockDb.rateLimitEvent.count.mockResolvedValue(0);
      mockDb.rateLimitEvent.deleteMany.mockResolvedValue({ count: 3 });
      await POST(makeRequest({ moduleId: "mod-1" }));
      expect(mockDb.rateLimitEvent.deleteMany).toHaveBeenCalled();
    });
  });

  // ── Vote / Unvote ────────────────────────────────────────────────────

  describe("vote toggle", () => {
    it("creates a vote and returns { voted: true } when no existing vote", async () => {
      mockDb.vote.deleteMany.mockResolvedValue({ count: 0 });
      const res = await POST(makeRequest({ moduleId: "mod-1" }));
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.voted).toBe(true);
      expect(mockDb.$transaction).toHaveBeenCalled();
    });

    it("removes existing vote and returns { voted: false }", async () => {
      mockDb.vote.deleteMany.mockResolvedValue({ count: 1 });
      const res = await POST(makeRequest({ moduleId: "mod-1" }));
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.voted).toBe(false);
      expect(mockDb.miniApp.update).toHaveBeenCalledWith({
        where: { id: "mod-1" },
        data: { voteCount: { decrement: 1 } },
      });
    });

    it("uses deleteMany for concurrency-safe unvote (idempotent)", async () => {
      mockDb.vote.deleteMany.mockResolvedValue({ count: 1 });
      await POST(makeRequest({ moduleId: "mod-1" }));
      expect(mockDb.vote.deleteMany).toHaveBeenCalledWith({
        where: { userId: "user-1", moduleId: "mod-1" },
      });
    });
  });

  // ── Concurrency / P2002 ──────────────────────────────────────────────

  describe("concurrency safety", () => {
    it("handles P2002 unique constraint error gracefully (returns voted: true)", async () => {
      mockDb.vote.deleteMany.mockResolvedValue({ count: 0 });
      const p2002Error = new Prisma.PrismaClientKnownRequestError(
        "Unique constraint failed",
        { code: "P2002", clientVersion: "0.0.0" },
      );
      mockDb.$transaction.mockRejectedValue(p2002Error);

      const res = await POST(makeRequest({ moduleId: "mod-1" }));
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.voted).toBe(true);
    });

    it("re-throws non-P2002 errors", async () => {
      mockDb.vote.deleteMany.mockResolvedValue({ count: 0 });
      mockDb.$transaction.mockRejectedValue(new Error("DB connection lost"));

      await expect(POST(makeRequest({ moduleId: "mod-1" }))).rejects.toThrow(
        "DB connection lost",
      );
    });

    it("deleteMany handles concurrent unvote (count=0 means already removed)", async () => {
      // Two requests race to unvote — one gets count=1, the other gets count=0
      // The one with count=0 falls through to the vote path (correct behavior)
      mockDb.vote.deleteMany.mockResolvedValue({ count: 0 });
      const res = await POST(makeRequest({ moduleId: "mod-1" }));
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.voted).toBe(true);
    });
  });
});
