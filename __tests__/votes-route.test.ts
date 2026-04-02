import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    miniApp: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
    rateLimitEvent: {
      deleteMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { POST } from "@/app/api/votes/route";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type JsonReq = Pick<NextRequest, "json">;

function makeReq(body: unknown): JsonReq {
  return {
    json: vi.fn().mockResolvedValue(body),
  };
}

type TxRateLimit = {
  rateLimitEvent: {
    deleteMany: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
};

type TxVoteToggle = {
  vote: {
    deleteMany: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  miniApp: {
    update: ReturnType<typeof vi.fn>;
  };
};

type MockDb = {
  miniApp: { findUnique: ReturnType<typeof vi.fn> };
  $transaction: ReturnType<typeof vi.fn>;
  rateLimitEvent: TxRateLimit["rateLimitEvent"];
};

describe("POST /api/votes", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    const mockedAuth = vi.mocked(auth);
    mockedAuth.mockResolvedValue({ user: { id: "u1" } } as unknown as Awaited<ReturnType<typeof auth>>);

    // default: allow rate limit
    const mockedDb = db as unknown as MockDb;
    mockedDb.$transaction.mockImplementation(async (fn: (tx: TxRateLimit & TxVoteToggle) => unknown) => {
      return await fn({
        rateLimitEvent: mockedDb.rateLimitEvent,
        vote: {
          deleteMany: vi.fn(),
          create: vi.fn(),
        },
        miniApp: {
          update: vi.fn(),
        },
      });
    });

    mockedDb.rateLimitEvent.deleteMany.mockResolvedValue({ count: 0 });
    mockedDb.rateLimitEvent.count.mockResolvedValue(0);
    mockedDb.rateLimitEvent.create.mockResolvedValue({ id: "r1" });
  });

  it("401 when unauthenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as unknown as Awaited<ReturnType<typeof auth>>);

    const res = await POST(makeReq({ moduleId: "m1" }) as unknown as NextRequest);
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });

  it("400 when moduleId missing", async () => {
    const res = await POST(makeReq({}) as unknown as NextRequest);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "moduleId is required" });
  });

  it("404 when module not found", async () => {
    const mockedDb = db as unknown as MockDb;
    mockedDb.miniApp.findUnique.mockResolvedValue(null);

    const res = await POST(makeReq({ moduleId: "missing" }) as unknown as NextRequest);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Module not found" });
  });

  it("403 when module not approved", async () => {
    const mockedDb = db as unknown as MockDb;
    mockedDb.miniApp.findUnique.mockResolvedValue({ id: "m1", status: "PENDING" });

    const res = await POST(makeReq({ moduleId: "m1" }) as unknown as NextRequest);
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "Only approved modules can be voted on" });
  });

  it("toggles to voted=true when no existing vote", async () => {
    const mockedDb = db as unknown as MockDb;
    mockedDb.miniApp.findUnique.mockResolvedValue({ id: "m1", status: "APPROVED" });

    const voteDeleteMany = vi.fn().mockResolvedValue({ count: 0 });
    const voteCreate = vi.fn().mockResolvedValue({ id: "v1" });
    const moduleUpdate = vi.fn().mockResolvedValue({ id: "m1" });

    mockedDb.$transaction.mockImplementationOnce(async (fn: (tx: TxRateLimit) => unknown) => {
      // checkRateLimit transaction
      return await fn({ rateLimitEvent: mockedDb.rateLimitEvent });
    });
    mockedDb.$transaction.mockImplementationOnce(async (fn: (tx: TxVoteToggle) => unknown) => {
      // vote toggle transaction
      return await fn({
        vote: { deleteMany: voteDeleteMany, create: voteCreate },
        miniApp: { update: moduleUpdate },
      });
    });

    const res = await POST(makeReq({ moduleId: "m1" }) as unknown as NextRequest);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ voted: true });
    expect(voteDeleteMany).toHaveBeenCalled();
    expect(voteCreate).toHaveBeenCalled();
    expect(moduleUpdate).toHaveBeenCalled();
  });

  it("toggles to voted=false when existing vote is deleted", async () => {
    const mockedDb = db as unknown as MockDb;
    mockedDb.miniApp.findUnique.mockResolvedValue({ id: "m1", status: "APPROVED" });

    const voteDeleteMany = vi.fn().mockResolvedValue({ count: 1 });
    const voteCreate = vi.fn();
    const moduleUpdate = vi.fn().mockResolvedValue({ id: "m1" });

    mockedDb.$transaction.mockImplementationOnce(async (fn: (tx: TxRateLimit) => unknown) => {
      // checkRateLimit transaction
      return await fn({ rateLimitEvent: mockedDb.rateLimitEvent });
    });
    mockedDb.$transaction.mockImplementationOnce(async (fn: (tx: TxVoteToggle) => unknown) => {
      // vote toggle transaction
      return await fn({
        vote: { deleteMany: voteDeleteMany, create: voteCreate },
        miniApp: { update: moduleUpdate },
      });
    });

    const res = await POST(makeReq({ moduleId: "m1" }) as unknown as NextRequest);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ voted: false });
    expect(voteCreate).not.toHaveBeenCalled();
    expect(moduleUpdate).toHaveBeenCalled();
  });

  it("returns voted=true on unique constraint race (P2002)", async () => {
    const mockedDb = db as unknown as MockDb;
    mockedDb.miniApp.findUnique.mockResolvedValue({ id: "m1", status: "APPROVED" });

    const voteDeleteMany = vi.fn().mockResolvedValue({ count: 0 });
    const voteCreate = vi.fn().mockRejectedValue({ code: "P2002" });
    const moduleUpdate = vi.fn();

    mockedDb.$transaction.mockImplementationOnce(async (fn: (tx: TxRateLimit) => unknown) => {
      // checkRateLimit transaction
      return await fn({ rateLimitEvent: mockedDb.rateLimitEvent });
    });
    mockedDb.$transaction.mockImplementationOnce(async (fn: (tx: TxVoteToggle) => unknown) => {
      // vote toggle transaction
      return await fn({
        vote: { deleteMany: voteDeleteMany, create: voteCreate },
        miniApp: { update: moduleUpdate },
      });
    });

    const res = await POST(makeReq({ moduleId: "m1" }) as unknown as NextRequest);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ voted: true });
    expect(moduleUpdate).not.toHaveBeenCalled();
  });

  it("429 when rate limit exceeded", async () => {
    const mockedDb = db as unknown as MockDb;
    mockedDb.miniApp.findUnique.mockResolvedValue({ id: "m1", status: "APPROVED" });

    mockedDb.rateLimitEvent.count.mockResolvedValue(10);

    const res = await POST(makeReq({ moduleId: "m1" }) as unknown as NextRequest);
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({
      error: "Rate limit exceeded: max 10 votes per 60 seconds.",
    });
  });
});

