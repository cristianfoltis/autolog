import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../index';

vi.mock('../services/auth.service', () => ({
  registerUser: vi.fn(),
  loginUser: vi.fn(),
  sanitizeUser: vi.fn(),
  signToken: vi.fn(),
  findOrCreateGoogleUser: vi.fn(),
}));

import { registerUser, loginUser } from '../services/auth.service';

const mockResult = {
  token: 'mock-token',
  user: { id: 'user-1', email: 'test@test.com', name: 'Test User', googleId: null },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('POST /auth/register', () => {
  it('returns 201 with token and user on success', async () => {
    vi.mocked(registerUser).mockResolvedValue(mockResult);

    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'test@test.com', password: 'password123', name: 'Test User' });

    expect(res.status).toBe(201);
    expect(res.body.token).toBe('mock-token');
    expect(res.body.user.email).toBe('test@test.com');
  });

  it('returns 409 when email is already taken', async () => {
    vi.mocked(registerUser).mockRejectedValue(new Error('EMAIL_TAKEN'));

    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'test@test.com', password: 'password123' });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Email already in use');
  });

  it('returns 500 on unexpected error', async () => {
    vi.mocked(registerUser).mockRejectedValue(new Error('DB_DOWN'));

    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'test@test.com', password: 'password123' });

    expect(res.status).toBe(500);
  });
});

describe('POST /auth/login', () => {
  it('returns 200 with token and user on valid credentials', async () => {
    vi.mocked(loginUser).mockResolvedValue(mockResult);

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'test@test.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBe('mock-token');
  });

  it('returns 401 on invalid credentials', async () => {
    vi.mocked(loginUser).mockRejectedValue(new Error('INVALID_CREDENTIALS'));

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'test@test.com', password: 'wrong' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid email or password');
  });

  it('returns 500 on unexpected error', async () => {
    vi.mocked(loginUser).mockRejectedValue(new Error('DB_DOWN'));

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'test@test.com', password: 'password123' });

    expect(res.status).toBe(500);
  });
});
