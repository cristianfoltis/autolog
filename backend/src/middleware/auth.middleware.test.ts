import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../index';

vi.mock('../prisma/client', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

import prisma from '../prisma/client';

const mockUser = {
  id: 'user-1',
  email: 'test@test.com',
  name: 'Test User',
  passwordHash: null,
  googleId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('JWT_SECRET', 'test-secret');
});

describe('requireAuth middleware', () => {
  it('returns 401 when no Authorization header is provided', async () => {
    const res = await request(app).get('/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 when Authorization header is not Bearer format', async () => {
    const res = await request(app).get('/auth/me').set('Authorization', 'Basic abc123');
    expect(res.status).toBe(401);
  });

  it('returns 401 when token is invalid', async () => {
    const res = await request(app).get('/auth/me').set('Authorization', 'Bearer invalid.token');
    expect(res.status).toBe(401);
  });

  it('returns 401 when token is valid but user no longer exists', async () => {
    const token = jwt.sign({ sub: 'user-1' }, 'test-secret');
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const res = await request(app).get('/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(401);
  });

  it('calls next and attaches user when token is valid', async () => {
    const token = jwt.sign({ sub: 'user-1' }, 'test-secret');
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

    const res = await request(app).get('/auth/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('test@test.com');
    expect(res.body).not.toHaveProperty('passwordHash');
  });
});
