import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    miniApp: {
      groupBy: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
    },
  },
}));

import { db } from "@/lib/db";
import { getMonthlyLeaderboard } from "@/lib/leaderboard";

type GroupByFn = ReturnType<typeof vi.fn>;
type FindManyFn = ReturnType<typeof vi.fn>;

const groupByMock = db.miniApp.groupBy as unknown as GroupByFn;
const findManyMock = db.user.findMany as unknown as FindManyFn;

describe("getMonthlyLeaderboard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-08T12:34:56.000Z"));
    groupByMock.mockReset();
    findManyMock.mockReset();
  });

  it("queries current UTC month with expected ordering and limit", async () => {
    groupByMock.mockResolvedValue([]);

    await getMonthlyLeaderboard(10);

    expect(groupByMock).toHaveBeenCalledTimes(1);
    expect(groupByMock).toHaveBeenCalledWith({
      by: ["authorId"],
      where: {
        status: "APPROVED",
        createdAt: {
          gte: new Date("2026-04-01T00:00:00.000Z"),
          lt: new Date("2026-05-01T00:00:00.000Z"),
        },
      },
      _count: { id: true },
      orderBy: [
        { _count: { id: "desc" } },
        { _min: { createdAt: "asc" } },
        { authorId: "asc" },
      ],
      take: 10,
    });
  });

  it("maps grouped rows to ranked leaderboard entries", async () => {
    groupByMock.mockResolvedValue([
      { authorId: "u2", _count: { id: 7 } },
      { authorId: "u1", _count: { id: 5 } },
      { authorId: "u3", _count: { id: 5 } },
    ]);

    findManyMock.mockResolvedValue([
      { id: "u1", name: "  Linh Nguyen  ", image: "https://img/linh.png" },
      { id: "u2", name: null, image: null },
      { id: "u3", name: "An Le", image: null },
    ]);

    const result = await getMonthlyLeaderboard(10);

    expect(findManyMock).toHaveBeenCalledWith({
      where: { id: { in: ["u2", "u1", "u3"] } },
      select: { id: true, name: true, image: true },
    });

    expect(result.items).toEqual([
      {
        rank: 1,
        userId: "u2",
        name: "Anonymous Contributor",
        image: null,
        approvedSubmissions: 7,
      },
      {
        rank: 2,
        userId: "u1",
        name: "Linh Nguyen",
        image: "https://img/linh.png",
        approvedSubmissions: 5,
      },
      {
        rank: 3,
        userId: "u3",
        name: "An Le",
        image: null,
        approvedSubmissions: 5,
      },
    ]);

    expect(result.monthStartUtc).toBe("2026-04-01T00:00:00.000Z");
    expect(result.nextMonthStartUtc).toBe("2026-05-01T00:00:00.000Z");
    expect(result.generatedAtUtc).toBe("2026-04-08T12:34:56.000Z");
  });

  it("returns empty items and skips user query when no contributors", async () => {
    groupByMock.mockResolvedValue([]);

    const result = await getMonthlyLeaderboard(10);

    expect(findManyMock).not.toHaveBeenCalled();
    expect(result.items).toEqual([]);
    expect(result.monthStartUtc).toBe("2026-04-01T00:00:00.000Z");
    expect(result.nextMonthStartUtc).toBe("2026-05-01T00:00:00.000Z");
  });
});
