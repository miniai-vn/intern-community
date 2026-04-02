import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.fn();
const voteLimitMock = vi.fn();
const moduleLimitMock = vi.fn();

const dbMock = {
  vote: {
    findUnique: vi.fn(),
    delete: vi.fn(),
    create: vi.fn(),
  },
  miniApp: {
    update: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
  },
  $transaction: vi.fn(),
};

vi.mock("@/lib/auth", () => ({
  auth: authMock,
}));

vi.mock("@/lib/db", () => ({
  db: dbMock,
}));

vi.mock("@/lib/rate-limit", () => ({
  voteRateLimit: {
    limit: voteLimitMock,
  },
  moduleRateLimit: {
    limit: moduleLimitMock,
  },
}));

function createRequest(body: unknown) {
  return {
    json: vi.fn().mockResolvedValue(body),
  } as never;
}

describe("rate-limited routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.mockResolvedValue({
      user: { id: "user-1", isAdmin: false, name: "Test User" },
    });
  });

  it("returns 429 for votes when the rate limit is exceeded", async () => {
    voteLimitMock.mockResolvedValue({ success: false });

    const { POST } = await import("@/app/api/votes/route");
    const response = await POST(createRequest({ moduleId: "module-1" }));
    const body = await response.json();

    expect(response.status).toBe(429);
    expect(body).toEqual({ error: "Too many votes. Please wait a moment." });
    expect(voteLimitMock).toHaveBeenCalledWith("user-1");
    expect(dbMock.vote.findUnique).not.toHaveBeenCalled();
  });

  it("returns 429 for module submissions when the rate limit is exceeded", async () => {
    moduleLimitMock.mockResolvedValue({ success: false });

    const { POST } = await import("@/app/api/modules/route");
    const response = await POST(
      createRequest({
        name: "Budget Buddy",
        description: "A budgeting helper for personal spending insights.",
        categoryId: "ckqexamplecategoryid1234567",
        repoUrl: "https://github.com/example/budget-buddy",
      })
    );
    const body = await response.json();

    expect(response.status).toBe(429);
    expect(body).toEqual({ error: "Too many submissions. Please wait a moment." });
    expect(moduleLimitMock).toHaveBeenCalledWith("user-1");
    expect(dbMock.miniApp.findMany).not.toHaveBeenCalled();
    expect(dbMock.miniApp.create).not.toHaveBeenCalled();
  });
});
