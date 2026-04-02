import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { db } from '@/lib/db';
import LeaderboardPage, { revalidate } from '@/app/leaderboard/page';

// Mock the DB to prevent real queries
vi.mock('@/lib/db', () => ({
  db: {
    miniApp: {
      groupBy: vi.fn().mockResolvedValue([]),
    },
    user: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

describe('Leaderboard Edge Case: 1st of the month at 00:01 UTC', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should query for submissions starting from 1st of the CURRENT month', async () => {
    // REQUIREMENT: What happens on the 1st of a new month at 00:01 UTC?
    // ACTUALLY: Because of Next.js ISR (\`revalidate = 600\`), if a request hits at 00:01 UTC, 
    // it will return the cached page from the previous month. Once the 10 min cache expires, 
    // it executes this component. Let's verify what happens when it DOES execute.

    // Arrange: Set time to May 1st at 00:01 UTC
    const mockDate = new Date('2026-05-01T00:01:00Z');
    vi.setSystemTime(mockDate);

    // Act: Render the page component (as a normal async function call)
    await LeaderboardPage();

    // Assert: Check if Prisma was called with the correct \`createdAt.gte\`
    const expectedStartOfMonth = new Date('2026-05-01T00:00:00Z');

    expect(db.miniApp.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'APPROVED',
          createdAt: {
            gte: expectedStartOfMonth,
          },
        }),
      })
    );
  });

  it('should query for submissions from the SAME month if it is the last day at 23:59 UTC', async () => {
    // Arrange: Set time to April 30th at 23:59 UTC
    const mockDate = new Date('2026-04-30T23:59:00Z');
    vi.setSystemTime(mockDate);

    // Act
    await LeaderboardPage();

    // Assert: Start of month should be April 1st
    const expectedStartOfMonth = new Date('2026-04-01T00:00:00Z');

    expect(db.miniApp.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'APPROVED',
          createdAt: {
            gte: expectedStartOfMonth,
          },
        }),
      })
    );
  });
});

describe('Leaderboard Page Configuration', () => {
  it('should export revalidate configured to 600 seconds (10 minutes) for ISR', () => {
    expect(revalidate).toBe(600);
  });
});
