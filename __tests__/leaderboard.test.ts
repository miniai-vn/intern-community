import { beforeEach, describe, expect, it, vi } from "vitest";

const mockDb = {
  miniApp: {
    groupBy: vi.fn(),
  },
  user: {
    findMany: vi.fn(),
  },
};

vi.mock("@/lib/db", () => ({
  db: mockDb,
}));

describe("leaderboard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-17T12:00:00.000Z"));
    vi.clearAllMocks();
  });

  it("computes current UTC month boundaries correctly", async () => {
    const { getCurrentUtcMonthRange } = await import("@/lib/leaderboard");

    const { monthStartUtc, nextMonthStartUtc } = getCurrentUtcMonthRange(
      new Date("2026-04-17T12:34:56.000Z"),
    );

    expect(monthStartUtc.toISOString()).toBe("2026-04-01T00:00:00.000Z");
    expect(nextMonthStartUtc.toISOString()).toBe("2026-05-01T00:00:00.000Z");
  });

  it("returns ranked contributors for current month and maps user info", async () => {
    mockDb.miniApp.groupBy.mockResolvedValue([
      { authorId: "u3", _count: { id: 5 } },
      { authorId: "u1", _count: { id: 3 } },
      { authorId: "u2", _count: { id: 1 } },
    ]);

    mockDb.user.findMany.mockResolvedValue([
      { id: "u1", name: "Alice", image: "https://avatar.example/alice.png" },
      { id: "u3", name: "Charlie", image: null },
      // u2 intentionally missing to verify fallback behavior
    ]);

    const { getCurrentMonthLeaderboard } = await import("@/lib/leaderboard");
    const result = await getCurrentMonthLeaderboard(5);

    expect(mockDb.miniApp.groupBy).toHaveBeenCalledWith({
      by: ["authorId"],
      where: {
        status: "APPROVED",
        createdAt: {
          gte: new Date("2026-04-01T00:00:00.000Z"),
          lt: new Date("2026-05-01T00:00:00.000Z"),
        },
      },
      _count: { id: true },
      orderBy: [{ _count: { id: "desc" } }, { authorId: "asc" }],
      take: 5,
    });

    expect(mockDb.user.findMany).toHaveBeenCalledWith({
      where: {
        id: { in: ["u3", "u1", "u2"] },
      },
      select: {
        id: true,
        name: true,
        image: true,
      },
    });

    expect(result.monthLabelUtc).toBe("April 2026");
    expect(result.monthStartIso).toBe("2026-04-01T00:00:00.000Z");
    expect(result.monthEndIso).toBe("2026-05-01T00:00:00.000Z");
    expect(result.contributors).toEqual([
      {
        rank: 1,
        userId: "u3",
        name: "Charlie",
        avatarUrl: null,
        approvedSubmissions: 5,
      },
      {
        rank: 2,
        userId: "u1",
        name: "Alice",
        avatarUrl: "https://avatar.example/alice.png",
        approvedSubmissions: 3,
      },
      {
        rank: 3,
        userId: "u2",
        name: "Unknown",
        avatarUrl: null,
        approvedSubmissions: 1,
      },
    ]);
  });

  it("returns empty contributors when no approved submissions exist in current month", async () => {
    mockDb.miniApp.groupBy.mockResolvedValue([]);

    const { getCurrentMonthLeaderboard } = await import("@/lib/leaderboard");
    const result = await getCurrentMonthLeaderboard();

    expect(mockDb.user.findMany).not.toHaveBeenCalled();
    expect(result.monthLabelUtc).toBe("April 2026");
    expect(result.monthStartIso).toBe("2026-04-01T00:00:00.000Z");
    expect(result.monthEndIso).toBe("2026-05-01T00:00:00.000Z");
    expect(result.contributors).toEqual([]);
  });
});
