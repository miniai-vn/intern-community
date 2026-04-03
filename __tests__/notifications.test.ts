import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock auth and db before importing the route
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    miniApp: {
      update: vi.fn(),
    },
    notification: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/validations', () => ({
  adminReviewSchema: {
    safeParse: vi.fn(),
  },
}));

import { PATCH } from '@/app/api/modules/[id]/route';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { adminReviewSchema } from '@/lib/validations';
import { NextRequest } from 'next/server';

function makeRequest(body: object) {
  return new NextRequest('http://localhost/api/modules/test-id', {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

const MOCK_MODULE = {
  id: 'test-id',
  name: 'My Test Module',
  authorId: 'author-user-id',
  status: 'APPROVED',
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(auth).mockResolvedValue({
    user: { id: 'admin-id', isAdmin: true },
  } as never);
  vi.mocked(adminReviewSchema.safeParse).mockReturnValue({
    success: true,
    data: { status: 'APPROVED', feedback: undefined },
  } as never);
  vi.mocked(db.miniApp.update).mockResolvedValue(MOCK_MODULE as never);
  vi.mocked(db.notification.create).mockResolvedValue({} as never);
});

describe('PATCH /api/modules/[id] — notification side-effect', () => {
  it('creates a notification for the module author when status is APPROVED', async () => {
    const req = makeRequest({ status: 'APPROVED' });
    const params = Promise.resolve({ id: 'test-id' });

    await PATCH(req, { params });

    expect(db.notification.create).toHaveBeenCalledOnce();
    expect(db.notification.create).toHaveBeenCalledWith({
      data: {
        userId: MOCK_MODULE.authorId,
        message: `${MOCK_MODULE.name} was approved`,
      },
    });
  });

  it('creates a notification for the module author when status is REJECTED', async () => {
    vi.mocked(adminReviewSchema.safeParse).mockReturnValue({
      success: true,
      data: { status: 'REJECTED', feedback: 'Needs work' },
    } as never);
    vi.mocked(db.miniApp.update).mockResolvedValue({
      ...MOCK_MODULE,
      status: 'REJECTED',
    } as never);

    const req = makeRequest({ status: 'REJECTED', feedback: 'Needs work' });
    const params = Promise.resolve({ id: 'test-id' });

    await PATCH(req, { params });

    expect(db.notification.create).toHaveBeenCalledOnce();
    expect(db.notification.create).toHaveBeenCalledWith({
      data: {
        userId: MOCK_MODULE.authorId,
        message: `${MOCK_MODULE.name} was rejected`,
      },
    });
  });

  it('does NOT create a notification when status stays PENDING', async () => {
    vi.mocked(adminReviewSchema.safeParse).mockReturnValue({
      success: true,
      data: { status: 'PENDING', feedback: undefined },
    } as never);
    vi.mocked(db.miniApp.update).mockResolvedValue({
      ...MOCK_MODULE,
      status: 'PENDING',
    } as never);

    const req = makeRequest({ status: 'PENDING' });
    const params = Promise.resolve({ id: 'test-id' });

    await PATCH(req, { params });

    expect(db.notification.create).not.toHaveBeenCalled();
  });

  it('returns 403 and does NOT create a notification if caller is not admin', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'regular-user-id', isAdmin: false },
    } as never);

    const req = makeRequest({ status: 'APPROVED' });
    const params = Promise.resolve({ id: 'test-id' });

    const response = await PATCH(req, { params });

    expect(response.status).toBe(403);
    expect(db.notification.create).not.toHaveBeenCalled();
  });
});
