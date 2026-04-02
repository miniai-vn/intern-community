import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  return {
    authMock: vi.fn(),
    dbMock: {
      miniApp: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      moduleRevision: {
        create: vi.fn(),
      },
      $transaction: vi.fn(),
    },
  };
});

vi.mock("@/lib/auth", () => ({
  auth: mocks.authMock,
}));

vi.mock("@/lib/db", () => ({
  db: mocks.dbMock,
}));

import { POST } from "./route";

const validPayload = {
  name: "Updated Module Name",
  description: "Updated description that is long enough for validation.",
  categoryId: "cjjj5f0aj0000f2x8z5bn8g7k",
  repoUrl: "https://github.com/acme/updated-module",
  demoUrl: "https://updated.example.com",
};

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/modules/module_1/resubmit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/modules/[id]/resubmit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when user is not authenticated", async () => {
    mocks.authMock.mockResolvedValue(null);

    const response = await POST(makeRequest(validPayload), {
      params: Promise.resolve({ id: "module_1" }),
    });

    expect(response.status).toBe(401);
  });

  it("returns 403 when user is not the module author", async () => {
    mocks.authMock.mockResolvedValue({
      user: { id: "user_1", isAdmin: false },
    });
    mocks.dbMock.miniApp.findUnique.mockResolvedValue({
      id: "module_1",
      authorId: "user_2",
      status: "REJECTED",
      name: "Original",
      description: "Original description with enough content",
      repoUrl: "https://github.com/acme/original",
      demoUrl: null,
      categoryId: "cat_1",
    });

    const response = await POST(makeRequest(validPayload), {
      params: Promise.resolve({ id: "module_1" }),
    });

    expect(response.status).toBe(403);
  });

  it("returns 409 when status is not REJECTED", async () => {
    mocks.authMock.mockResolvedValue({
      user: { id: "user_1", isAdmin: false },
    });
    mocks.dbMock.miniApp.findUnique.mockResolvedValue({
      id: "module_1",
      authorId: "user_1",
      status: "APPROVED",
      name: "Original",
      description: "Original description with enough content",
      repoUrl: "https://github.com/acme/original",
      demoUrl: null,
      categoryId: "cat_1",
    });

    const response = await POST(makeRequest(validPayload), {
      params: Promise.resolve({ id: "module_1" }),
    });

    expect(response.status).toBe(409);
  });

  it("creates revision snapshot and updates module to PENDING", async () => {
    const existing = {
      id: "module_1",
      authorId: "user_1",
      status: "REJECTED",
      name: "Original",
      description: "Original description with enough content",
      repoUrl: "https://github.com/acme/original",
      demoUrl: null,
      categoryId: "cat_1",
    };

    const updated = {
      id: "module_1",
      status: "PENDING",
      name: validPayload.name,
      description: validPayload.description,
      repoUrl: validPayload.repoUrl,
      demoUrl: validPayload.demoUrl,
      categoryId: validPayload.categoryId,
      category: { id: validPayload.categoryId, name: "Tools", slug: "tools" },
      author: { id: "user_1", name: "Alice", image: null },
    };

    mocks.authMock.mockResolvedValue({
      user: { id: "user_1", isAdmin: false },
    });
    mocks.dbMock.miniApp.findUnique.mockResolvedValue(existing);
    mocks.dbMock.moduleRevision.create.mockResolvedValue({ id: "rev_1" });
    mocks.dbMock.miniApp.update.mockResolvedValue(updated);
    mocks.dbMock.$transaction.mockResolvedValue([{ id: "rev_1" }, updated]);

    const response = await POST(makeRequest(validPayload), {
      params: Promise.resolve({ id: "module_1" }),
    });

    expect(response.status).toBe(200);
    expect(mocks.dbMock.moduleRevision.create).toHaveBeenCalledWith({
      data: {
        moduleId: "module_1",
        name: existing.name,
        description: existing.description,
        repoUrl: existing.repoUrl,
        demoUrl: existing.demoUrl,
        status: existing.status,
        categoryId: existing.categoryId,
      },
    });
    expect(mocks.dbMock.miniApp.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "module_1" },
        data: expect.objectContaining({
          status: "PENDING",
          feedback: null,
          name: validPayload.name,
        }),
      })
    );

    const body = await response.json();
    expect(body.status).toBe("PENDING");
  });
});
