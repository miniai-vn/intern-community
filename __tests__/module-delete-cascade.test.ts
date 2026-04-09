import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    miniApp: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { DELETE } from "@/app/api/modules/[id]/route";

const mockedAuth = vi.mocked(auth);
const mockedFindUnique = vi.mocked(db.miniApp.findUnique);
const mockedDelete = vi.mocked(db.miniApp.delete);

function makeRequest() {
  return new NextRequest("http://localhost/api/modules/mod-1", {
    method: "DELETE",
  });
}

function makeParams(id = "mod-1") {
  return { params: Promise.resolve({ id }) };
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("DELETE /api/modules/[id] — cascade delete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes a module that has votes (cascade) without throwing", async () => {
    mockedAuth.mockResolvedValue({
      user: { id: "user-1", isAdmin: true, name: "Admin", email: "a@b.com", image: null },
      expires: "",
    } as never);

    mockedFindUnique.mockResolvedValue({
      id: "mod-1",
      slug: "test-module",
      name: "Test Module",
      description: "desc",
      repoUrl: "https://github.com/test/repo",
      demoUrl: null,
      status: "APPROVED",
      feedback: null,
      categoryId: "cat-1",
      authorId: "user-1",
      voteCount: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Simulate successful cascade delete (votes are auto-deleted by DB)
    mockedDelete.mockResolvedValue({} as never);

    const res = await DELETE(makeRequest(), makeParams());

    expect(res.status).toBe(204);
    expect(mockedDelete).toHaveBeenCalledWith({ where: { id: "mod-1" } });
  });

  it("returns 500-like error when cascade is missing and DB throws P2003", async () => {
    mockedAuth.mockResolvedValue({
      user: { id: "user-1", isAdmin: true, name: "Admin", email: "a@b.com", image: null },
      expires: "",
    } as never);

    mockedFindUnique.mockResolvedValue({
      id: "mod-1",
      slug: "test-module",
      name: "Test Module",
      description: "desc",
      repoUrl: "https://github.com/test/repo",
      demoUrl: null,
      status: "APPROVED",
      feedback: null,
      categoryId: "cat-1",
      authorId: "user-1",
      voteCount: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Simulate what happens WITHOUT onDelete: Cascade — P2003 FK error
    const fkError = Object.assign(
      new Error("Foreign key constraint failed on the field: `votes_moduleId_fkey`"),
      { code: "P2003" }
    );
    mockedDelete.mockRejectedValue(fkError);

    await expect(DELETE(makeRequest(), makeParams())).rejects.toThrow(
      "Foreign key constraint failed"
    );
  });
});
