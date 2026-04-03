import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

const dbMocks = vi.hoisted(() => ({
  voteFindUnique: vi.fn(),
  voteDelete: vi.fn(),
  voteCreate: vi.fn(),
  miniAppUpdate: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    vote: {
      findUnique: dbMocks.voteFindUnique,
      delete: dbMocks.voteDelete,
      create: dbMocks.voteCreate,
    },
    miniApp: {
      update: dbMocks.miniAppUpdate,
    },
    $transaction: dbMocks.transaction,
  },
}));

vi.mock("@/lib/rate-limit", () => {
  class MockRateLimitExceededError extends Error {
    retryAfterSeconds: number;

    constructor(retryAfterSeconds: number) {
      super(
        "Rate limit exceeded: max 10 vote requests per 60 seconds. Please try again shortly."
      );
      this.name = "RateLimitExceededError";
      this.retryAfterSeconds = retryAfterSeconds;
    }
  }

  class MockRateLimitStorageNotReadyError extends Error {
    constructor() {
      super(
        "Vote rate limiter storage is not initialized. Apply the latest database schema before using /api/votes."
      );
      this.name = "RateLimitStorageNotReadyError";
    }
  }

  return {
    assertVoteRateLimit: vi.fn(),
    RateLimitExceededError: MockRateLimitExceededError,
    RateLimitStorageNotReadyError: MockRateLimitStorageNotReadyError,
    isRateLimitExceededError: (
      error: unknown
    ): error is MockRateLimitExceededError =>
      error instanceof MockRateLimitExceededError,
    isRateLimitStorageNotReadyError: (
      error: unknown
    ): error is MockRateLimitStorageNotReadyError =>
      error instanceof MockRateLimitStorageNotReadyError,
  };
});

import { POST } from "@/app/api/votes/route";
import { auth } from "@/lib/auth";
import {
  assertVoteRateLimit,
  RateLimitExceededError,
  RateLimitStorageNotReadyError,
} from "@/lib/rate-limit";

function createVoteRequest(body: unknown = { moduleId: "module-1" }) {
  return new Request("http://localhost/api/votes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

function mockSession() {
  const mockedAuth = auth as unknown as Mock;
  mockedAuth.mockResolvedValue({
    user: {
      id: "user-1",
      isAdmin: false,
    },
    expires: new Date(Date.now() + 60_000).toISOString(),
  });
}

describe("POST /api/votes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMocks.voteDelete.mockReturnValue({ kind: "delete" });
    dbMocks.voteCreate.mockReturnValue({ kind: "create" });
    dbMocks.miniAppUpdate.mockReturnValue({ kind: "update" });
    dbMocks.transaction.mockResolvedValue(undefined);
  });

  it("returns 401 for unauthenticated users", async () => {
    const mockedAuth = auth as unknown as Mock;
    mockedAuth.mockResolvedValue(null);

    const response = await POST(createVoteRequest() as never);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Unauthorized" });
    expect(assertVoteRateLimit).not.toHaveBeenCalled();
  });

  it("returns 429 with Retry-After when the rate limit is exceeded", async () => {
    mockSession();
    vi.mocked(assertVoteRateLimit).mockRejectedValue(
      new RateLimitExceededError(42)
    );

    const response = await POST(createVoteRequest() as never);

    expect(assertVoteRateLimit).toHaveBeenCalledWith("user-1");
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("42");
    expect(await response.json()).toEqual({
      error:
        "Rate limit exceeded: max 10 vote requests per 60 seconds. Please try again shortly.",
    });
  });

  it("returns 503 when rate limiter storage is not initialized", async () => {
    mockSession();
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    vi.mocked(assertVoteRateLimit).mockRejectedValue(
      new RateLimitStorageNotReadyError()
    );

    const response = await POST(createVoteRequest() as never);

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: "Vote service is temporarily unavailable.",
    });
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

    consoleErrorSpy.mockRestore();
  });

  it("rethrows unexpected rate limiter errors", async () => {
    mockSession();
    vi.mocked(assertVoteRateLimit).mockRejectedValue(new Error("boom"));

    await expect(POST(createVoteRequest() as never)).rejects.toThrow("boom");
  });

  it("returns 400 when moduleId is missing", async () => {
    mockSession();
    vi.mocked(assertVoteRateLimit).mockResolvedValue(undefined);

    const response = await POST(createVoteRequest({}) as never);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "moduleId is required" });
    expect(dbMocks.voteFindUnique).not.toHaveBeenCalled();
  });

  it("returns voted false when removing an existing vote", async () => {
    mockSession();
    vi.mocked(assertVoteRateLimit).mockResolvedValue(undefined);
    dbMocks.voteFindUnique.mockResolvedValue({ id: "vote-1" });

    const response = await POST(createVoteRequest() as never);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ voted: false });
    expect(dbMocks.voteFindUnique).toHaveBeenCalledWith({
      where: { userId_moduleId: { userId: "user-1", moduleId: "module-1" } },
    });
    expect(dbMocks.voteDelete).toHaveBeenCalledWith({ where: { id: "vote-1" } });
    expect(dbMocks.miniAppUpdate).toHaveBeenCalledWith({
      where: { id: "module-1" },
      data: { voteCount: { decrement: 1 } },
    });
    expect(dbMocks.transaction).toHaveBeenCalledTimes(1);
  });

  it("returns voted true when creating a new vote", async () => {
    mockSession();
    vi.mocked(assertVoteRateLimit).mockResolvedValue(undefined);
    dbMocks.voteFindUnique.mockResolvedValue(null);

    const response = await POST(createVoteRequest() as never);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ voted: true });
    expect(dbMocks.voteCreate).toHaveBeenCalledWith({
      data: { userId: "user-1", moduleId: "module-1" },
    });
    expect(dbMocks.miniAppUpdate).toHaveBeenCalledWith({
      where: { id: "module-1" },
      data: { voteCount: { increment: 1 } },
    });
    expect(dbMocks.transaction).toHaveBeenCalledTimes(1);
  });
});
