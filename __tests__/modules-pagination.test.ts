import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks MUST be declared before importing the route (vitest hoists vi.mock)
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    miniApp: {
      findMany: vi.fn(),
    },
    vote: {
      findMany: vi.fn(),
    },
  },
}));

import { GET } from '@/app/api/modules/route';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(params: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/modules');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString());
}

function makeModule(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    slug: `module-${id}`,
    name: `Module ${id}`,
    description: 'A test module',
    repoUrl: 'https://github.com/test/repo',
    demoUrl: null,
    status: 'APPROVED',
    voteCount: 0,
    categoryId: 'cat-1',
    authorId: 'user-1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    category: { id: 'cat-1', name: 'Tools', slug: 'tools' },
    author: { id: 'user-1', name: 'Alice', image: null },
    ...overrides,
  };
}

/** Creates an array of n mock modules with sequential IDs */
function makeModules(n: number) {
  return Array.from({ length: n }, (_, i) => makeModule(String(i + 1)));
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
  // Default: unauthenticated caller
  vi.mocked(auth).mockResolvedValue(null as never);
  // Default: vote lookup returns nothing
  vi.mocked(db.vote.findMany).mockResolvedValue([]);
});

// ---------------------------------------------------------------------------
// Pagination logic
// ---------------------------------------------------------------------------

describe('GET /api/modules — pagination', () => {
  it('returns nextCursor: null when there are 12 or fewer modules', async () => {
    vi.mocked(db.miniApp.findMany).mockResolvedValue(makeModules(12) as never);

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(body.nextCursor).toBeNull();
    expect(body.items).toHaveLength(12);
  });

  it('returns nextCursor: null when there are fewer than 12 modules', async () => {
    vi.mocked(db.miniApp.findMany).mockResolvedValue(makeModules(5) as never);

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(body.nextCursor).toBeNull();
    expect(body.items).toHaveLength(5);
  });

  it('returns nextCursor and only 12 items when DB returns 13 (has next page)', async () => {
    // API fetches limit+1=13 to detect if more exist
    const modules = makeModules(13);
    vi.mocked(db.miniApp.findMany).mockResolvedValue(modules as never);

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(body.items).toHaveLength(12);
    // nextCursor must equal the id of the 12th item (last one kept)
    expect(body.nextCursor).toBe(modules[11].id);
  });

  it('passes cursor and skip:1 to Prisma when ?cursor= is provided', async () => {
    vi.mocked(db.miniApp.findMany).mockResolvedValue(makeModules(3) as never);

    await GET(makeRequest({ cursor: 'abc-123' }));

    expect(db.miniApp.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 1,
        cursor: { id: 'abc-123' },
      })
    );
  });

  it('does NOT add cursor/skip to the Prisma query when no cursor param', async () => {
    vi.mocked(db.miniApp.findMany).mockResolvedValue(makeModules(3) as never);

    await GET(makeRequest());

    const call = vi.mocked(db.miniApp.findMany).mock.calls[0][0] as Record<string, unknown>;
    expect(call).not.toHaveProperty('cursor');
    expect(call).not.toHaveProperty('skip');
  });
});

// ---------------------------------------------------------------------------
// hasVoted logic
// ---------------------------------------------------------------------------

describe('GET /api/modules — hasVoted', () => {
  it('sets hasVoted: false on all items when caller is unauthenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    vi.mocked(db.miniApp.findMany).mockResolvedValue(makeModules(3) as never);

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(body.items.every((m: { hasVoted: boolean }) => m.hasVoted === false)).toBe(true);
    // Should not query votes at all
    expect(db.vote.findMany).not.toHaveBeenCalled();
  });

  it('sets hasVoted: false on all items when authenticated user has no votes', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-99' } } as never);
    vi.mocked(db.miniApp.findMany).mockResolvedValue(makeModules(3) as never);
    vi.mocked(db.vote.findMany).mockResolvedValue([]);

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(body.items.every((m: { hasVoted: boolean }) => m.hasVoted === false)).toBe(true);
  });

  it('marks only voted modules as hasVoted: true for authenticated user', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-99' } } as never);

    const modules = makeModules(3); // ids: "1", "2", "3"
    vi.mocked(db.miniApp.findMany).mockResolvedValue(modules as never);

    // User voted on module "2" only
    vi.mocked(db.vote.findMany).mockResolvedValue([
      { moduleId: '2' },
    ] as never);

    const res = await GET(makeRequest());
    const body = await res.json();

    const byId = Object.fromEntries(
      body.items.map((m: { id: string; hasVoted: boolean }) => [m.id, m.hasVoted])
    );
    expect(byId['1']).toBe(false);
    expect(byId['2']).toBe(true);
    expect(byId['3']).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Search / category filtering (verifies params are forwarded to Prisma)
// ---------------------------------------------------------------------------

describe('GET /api/modules — filters', () => {
  it('passes category slug filter to Prisma when ?category= is provided', async () => {
    vi.mocked(db.miniApp.findMany).mockResolvedValue([]);

    await GET(makeRequest({ category: 'tools' }));

    expect(db.miniApp.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          category: { slug: 'tools' },
        }),
      })
    );
  });

  it('passes search filter to Prisma when ?q= is provided', async () => {
    vi.mocked(db.miniApp.findMany).mockResolvedValue([]);

    await GET(makeRequest({ q: 'timer' }));

    expect(db.miniApp.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { name: { contains: 'timer', mode: 'insensitive' } },
            { description: { contains: 'timer', mode: 'insensitive' } },
          ],
        }),
      })
    );
  });
});
