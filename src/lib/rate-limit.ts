import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export const VOTE_RATE_LIMIT_MAX_REQUESTS = 10;
export const VOTE_RATE_LIMIT_WINDOW_SECONDS = 60;

const VOTE_RATE_LIMIT_SCOPE = "votes";

type CountRow = {
  count: bigint;
};

type RetryAfterRow = {
  retryAfter: number | null;
};

export class RateLimitExceededError extends Error {
  retryAfterSeconds: number;

  constructor(retryAfterSeconds: number) {
    super(
      `Rate limit exceeded: max ${VOTE_RATE_LIMIT_MAX_REQUESTS} vote requests per ${VOTE_RATE_LIMIT_WINDOW_SECONDS} seconds. Please try again shortly.`
    );
    this.name = "RateLimitExceededError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class RateLimitStorageNotReadyError extends Error {
  constructor() {
    super(
      "Vote rate limiter storage is not initialized. Apply the latest database schema before using /api/votes."
    );
    this.name = "RateLimitStorageNotReadyError";
  }
}

export function isRateLimitExceededError(
  error: unknown
): error is RateLimitExceededError {
  return error instanceof RateLimitExceededError;
}

export function isRateLimitStorageNotReadyError(
  error: unknown
): error is RateLimitStorageNotReadyError {
  return error instanceof RateLimitStorageNotReadyError;
}

function isMissingRateLimitTableError(error: unknown) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return false;
  }

  if (error.code !== "P2010") {
    return false;
  }

  const meta = error.meta as
    | {
        driverAdapterError?: {
          cause?: {
            code?: string;
            message?: string;
          };
        };
      }
    | undefined;

  const driverCode = meta?.driverAdapterError?.cause?.code;
  const driverMessage = meta?.driverAdapterError?.cause?.message ?? "";

  return (
    driverCode === "42P01" ||
    driverMessage.includes('relation "rate_limit_events" does not exist')
  );
}

export async function assertVoteRateLimit(userId: string) {
  try {
    await db.$transaction(async (tx) => {
      await tx.$executeRaw`
        SELECT pg_advisory_xact_lock(
          hashtext(${VOTE_RATE_LIMIT_SCOPE}),
          hashtext(${userId})
        )
      `;

      await tx.$executeRaw`
        DELETE FROM "rate_limit_events"
        WHERE "scope" = ${VOTE_RATE_LIMIT_SCOPE}
          AND "userId" = ${userId}
          AND "createdAt" < NOW() - make_interval(secs => ${VOTE_RATE_LIMIT_WINDOW_SECONDS})
      `;

      const [countRow] = await tx.$queryRaw<CountRow[]>(Prisma.sql`
        SELECT COUNT(*)::bigint AS count
        FROM "rate_limit_events"
        WHERE "scope" = ${VOTE_RATE_LIMIT_SCOPE}
          AND "userId" = ${userId}
          AND "createdAt" >= NOW() - make_interval(secs => ${VOTE_RATE_LIMIT_WINDOW_SECONDS})
      `);

      const currentCount = countRow?.count ? Number(countRow.count) : 0;

      if (currentCount >= VOTE_RATE_LIMIT_MAX_REQUESTS) {
        const [retryAfterRow] = await tx.$queryRaw<RetryAfterRow[]>(Prisma.sql`
          SELECT GREATEST(
            1,
            CEIL(
              EXTRACT(
                EPOCH FROM (
                  MIN("createdAt") + make_interval(secs => ${VOTE_RATE_LIMIT_WINDOW_SECONDS}) - NOW()
                )
              )
            )
          )::int AS "retryAfter"
          FROM "rate_limit_events"
          WHERE "scope" = ${VOTE_RATE_LIMIT_SCOPE}
            AND "userId" = ${userId}
            AND "createdAt" >= NOW() - make_interval(secs => ${VOTE_RATE_LIMIT_WINDOW_SECONDS})
        `);

        throw new RateLimitExceededError(
          retryAfterRow?.retryAfter ?? VOTE_RATE_LIMIT_WINDOW_SECONDS
        );
      }

      await tx.rateLimitEvent.create({
        data: {
          userId,
          scope: VOTE_RATE_LIMIT_SCOPE,
        },
      });
    });
  } catch (error) {
    if (isMissingRateLimitTableError(error)) {
      throw new RateLimitStorageNotReadyError();
    }

    throw error;
  }
}
