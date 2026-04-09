// __tests__/modules.test.ts
import 'dotenv/config';
import { expect, test, describe, vi, beforeEach, afterAll } from 'vitest';
import { DELETE } from '@/app/api/modules/[id]/route';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { NextRequest } from 'next/server';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

describe("API DELETE /api/modules/[id] - Issue #153", () => {
  const mockUserId = "test-user-123";
  const mockModuleId = "test-module-456";
  const mockCategoryId = "test-cat-123";

  beforeEach(async () => {
    // Delete old if any, then create fresh data for each test
    await db.miniApp.deleteMany({ where: { authorId: mockUserId } });
    await db.category.deleteMany({ where: { id: mockCategoryId } });
    await db.user.deleteMany({ where: { id: mockUserId } });

    // 2. Create mock user and category for testing
    await db.user.create({
      data: { id: mockUserId, name: "Test User", email: "test@example.com" }
    });
    
    await db.category.create({
      data: { id: mockCategoryId, name: "Test Category", slug: "test-category" }
    });
  });

  // Clean up after all tests to ensure no leftover data
  afterAll(async () => {
    await db.miniApp.deleteMany({ where: { authorId: mockUserId } });
    await db.category.deleteMany({ where: { id: mockCategoryId } });
    await db.user.deleteMany({ where: { id: mockUserId } });
  });

  test("Delete a module with PENDING status successfully", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: mockUserId } } as any);
    
    const module = await db.miniApp.create({
      data: { 
        id: mockModuleId, 
        authorId: mockUserId, 
        categoryId: mockCategoryId,
        status: "PENDING",
        name: "Test Module",
        slug: "test-module-1",
        description: "Test description",
        repoUrl: "https://github.com/test",
      },
    });

    const req = new NextRequest(`http://localhost:3000/api/modules/${module.id}`);
    
    const response = await DELETE(req, { params: Promise.resolve({ id: module.id }) });

    expect(response.status).toBe(204);
    
    const updatedModule = await db.miniApp.findUnique({ where: { id: module.id } });
    expect(updatedModule?.isDeleted).toBe(true);
  });

  test("Fail (403) when module is already APPROVED", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: mockUserId } } as any);
    
    const module = await db.miniApp.create({
      data: { 
        id: mockModuleId, 
        authorId: mockUserId,
        categoryId: mockCategoryId, 
        status: "APPROVED", 
        name: "Test Module 2",
        slug: "test-module-2",
        description: "Test description 2",
        repoUrl: "https://github.com/test2",
      },
    });

    const req = new NextRequest(`http://localhost:3000/api/modules/${module.id}`);
    const response = await DELETE(req, { params: Promise.resolve({ id: module.id }) });

    expect(response.status).toBe(403); 
    
    const dbModule = await db.miniApp.findUnique({ where: { id: module.id } });
    expect(dbModule?.isDeleted).toBe(false); 
  });

  test("Login failed", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as any);
    
    const req = new NextRequest(`http://localhost:3000/api/modules/any-id`);
    const response = await DELETE(req, { params: Promise.resolve({ id: "any-id" }) });

    expect(response.status).toBe(401);
  });
});