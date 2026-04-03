import { Prisma } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  transaction: vi.fn(),
  executeRaw: vi.fn(),
  queryRaw: vi.fn(),
  rateLimitEventCreate: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    $transaction: dbMocks.transaction,
  },
}));

import {
  assertVoteRateLimit,
  isRateLimitExceededError,
  isRateLimitStorageNotReadyError,
  RateLimitExceededError,
  RateLimitStorageNotReadyError,
  VOTE_RATE_LIMIT_WINDOW_SECONDS,
} from "@/lib/rate-limit";

function createTransactionMock() {
  return {
    $executeRaw: dbMocks.executeRaw,
    $queryRaw: dbMocks.queryRaw,
    rateLimitEvent: {
      create: dbMocks.rateLimitEventCreate,
    },
  };
}

function createKnownRequestError(
  code: string,
  meta?: Record<string, unknown>
) {
  return new Prisma.PrismaClientKnownRequestError("raw query failed", {
    code,
    clientVersion: "7.6.0",
    meta,
  });
}

describe("rate-limit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMocks.executeRaw.mockResolvedValue(undefined);
    dbMocks.rateLimitEventCreate.mockResolvedValue({ id: "event-1" });
    dbMocks.transaction.mockImplementation(async (callback) =>
      callback(createTransactionMock())
    );
  });

  it("creates a descriptive RateLimitExceededError", () => {
    const error = new RateLimitExceededError(7);

    expect(error.name).toBe("RateLimitExceededError");
    expect(error.retryAfterSeconds).toBe(7);
    expect(error.message).toContain("max 10 vote requests per 60 seconds");
  });

  it("creates a descriptive RateLimitStorageNotReadyError", () => {
    const error = new RateLimitStorageNotReadyError();

    expect(error.name).toBe("RateLimitStorageNotReadyError");
    expect(error.message).toContain("storage is not initialized");
  });

  it("detects RateLimitExceededError via type guard", () => {
    expect(isRateLimitExceededError(new RateLimitExceededError(1))).toBe(true);
    expect(isRateLimitExceededError(new Error("nope"))).toBe(false);
  });

  it("detects RateLimitStorageNotReadyError via type guard", () => {
    expect(isRateLimitStorageNotReadyError(new RateLimitStorageNotReadyError())).toBe(
      true
    );
    expect(isRateLimitStorageNotReadyError(new Error("nope"))).toBe(false);
  });

  it("allows requests under the limit and stores an event", async () => {
    dbMocks.queryRaw.mockResolvedValueOnce([{ count: BigInt(0) }]);

    await expect(assertVoteRateLimit("user-1")).resolves.toBeUndefined();

    expect(dbMocks.executeRaw).toHaveBeenCalledTimes(2);
    expect(dbMocks.queryRaw).toHaveBeenCalledTimes(1);
    expect(dbMocks.rateLimitEventCreate).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        scope: "votes",
      },
    });
  });

  it("throws RateLimitExceededError with retryAfter from the query result", async () => {
    dbMocks.queryRaw
      .mockResolvedValueOnce([{ count: BigInt(10) }])
      .mockResolvedValueOnce([{ retryAfter: 12 }]);

    await expect(assertVoteRateLimit("user-1")).rejects.toMatchObject({
      name: "RateLimitExceededError",
      retryAfterSeconds: 12,
    });

    expect(dbMocks.rateLimitEventCreate).not.toHaveBeenCalled();
  });

  it("falls back to the default retryAfter when the query returns null", async () => {
    dbMocks.queryRaw
      .mockResolvedValueOnce([{ count: BigInt(10) }])
      .mockResolvedValueOnce([{ retryAfter: null }]);

    await expect(assertVoteRateLimit("user-1")).rejects.toMatchObject({
      retryAfterSeconds: VOTE_RATE_LIMIT_WINDOW_SECONDS,
    });
  });

  it("converts missing table errors into RateLimitStorageNotReadyError", async () => {
    dbMocks.transaction.mockRejectedValue(
      createKnownRequestError("P2010", {
        driverAdapterError: {
          cause: {
            code: "42P01",
          },
        },
      })
    );

    await expect(assertVoteRateLimit("user-1")).rejects.toBeInstanceOf(
      RateLimitStorageNotReadyError
    );
  });

  it("also detects missing table errors from the driver message", async () => {
    dbMocks.transaction.mockRejectedValue(
      createKnownRequestError("P2010", {
        driverAdapterError: {
          cause: {
            message: 'relation "rate_limit_events" does not exist',
          },
        },
      })
    );

    await expect(assertVoteRateLimit("user-1")).rejects.toBeInstanceOf(
      RateLimitStorageNotReadyError
    );
  });

  it("rethrows Prisma known request errors that are not missing-table errors", async () => {
    const error = createKnownRequestError("P9999");
    dbMocks.transaction.mockRejectedValue(error);

    await expect(assertVoteRateLimit("user-1")).rejects.toBe(error);
  });

  it("rethrows unknown errors", async () => {
    const error = new Error("unexpected");
    dbMocks.transaction.mockRejectedValue(error);

    await expect(assertVoteRateLimit("user-1")).rejects.toBe(error);
  });
});
