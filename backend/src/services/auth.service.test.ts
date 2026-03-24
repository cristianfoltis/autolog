import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  registerUser,
  loginUser,
  findOrCreateGoogleUser,
  sanitizeUser,
  signToken,
} from './auth.service';

vi.mock('../prisma/client', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import prisma from '../prisma/client';

const mockUser = {
  id: 'user-1',
  email: 'test@test.com',
  name: 'Test User',
  passwordHash: 'hashed',
  googleId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('JWT_SECRET', 'test-secret');
});

describe('sanitizeUser', () => {
  it('removes passwordHash from user object', () => {
    const result = sanitizeUser(mockUser);
    expect(result).not.toHaveProperty('passwordHash');
    expect(result).toMatchObject({ id: 'user-1', email: 'test@test.com' });
  });
});

describe('signToken', () => {
  it('returns a valid JWT containing the user id', () => {
    const token = signToken('user-1');
    const payload = jwt.verify(token, 'test-secret') as { sub: string };
    expect(payload.sub).toBe('user-1');
  });
});

describe('registerUser', () => {
  it('creates a new user and returns token and sanitized user', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue(mockUser);

    const result = await registerUser('test@test.com', 'password123', 'Test User');

    expect(result.token).toBeDefined();
    expect(result.user.email).toBe('test@test.com');
    expect(result.user).not.toHaveProperty('passwordHash');
  });

  it('throws EMAIL_TAKEN if email already exists', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

    await expect(registerUser('test@test.com', 'password123')).rejects.toThrow('EMAIL_TAKEN');
  });
});

describe('loginUser', () => {
  it('returns token and user on valid credentials', async () => {
    const hash = await bcrypt.hash('password123', 10);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ ...mockUser, passwordHash: hash });

    const result = await loginUser('test@test.com', 'password123');

    expect(result.token).toBeDefined();
    expect(result.user.email).toBe('test@test.com');
  });

  it('throws INVALID_CREDENTIALS when user does not exist', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    await expect(loginUser('test@test.com', 'password123')).rejects.toThrow('INVALID_CREDENTIALS');
  });

  it('throws INVALID_CREDENTIALS when password is wrong', async () => {
    const hash = await bcrypt.hash('correct-password', 10);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ ...mockUser, passwordHash: hash });

    await expect(loginUser('test@test.com', 'wrong-password')).rejects.toThrow(
      'INVALID_CREDENTIALS',
    );
  });

  it('throws INVALID_CREDENTIALS when user has no password (Google-only account)', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ ...mockUser, passwordHash: null });

    await expect(loginUser('test@test.com', 'password123')).rejects.toThrow('INVALID_CREDENTIALS');
  });
});

describe('findOrCreateGoogleUser', () => {
  it('returns existing user if googleId matches', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

    const result = await findOrCreateGoogleUser('google-1', 'test@test.com', 'Test User');

    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(result.user.email).toBe('test@test.com');
  });

  it('creates a new user when neither googleId nor email exists', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue(mockUser);

    await findOrCreateGoogleUser('google-1', 'new@test.com', 'New User');

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: { email: 'new@test.com', googleId: 'google-1', name: 'New User' },
    });
  });

  it('links googleId to existing email/password account', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null).mockResolvedValueOnce(mockUser);
    vi.mocked(prisma.user.update).mockResolvedValue(mockUser);

    await findOrCreateGoogleUser('google-1', 'test@test.com', 'Test User');

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { googleId: 'google-1' },
    });
  });
});
