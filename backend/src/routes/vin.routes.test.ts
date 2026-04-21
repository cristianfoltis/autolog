import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../index';

vi.mock('../prisma/client', () => ({
  default: {
    user: { findUnique: vi.fn() },
    make: { findFirst: vi.fn() },
    model: { findFirst: vi.fn() },
  },
}));

import prisma from '../prisma/client';

const mockUser = {
  id: 'user-1',
  email: 'test@test.com',
  name: 'Test',
  passwordHash: null,
  googleId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockMake = { id: 109, name: 'Seat' };
const mockModel = { id: 2821, name: 'Leon', makeId: 109 };

const VALID_VIN = 'VSSZZZ5FZGR117755';

const autoDevSuccess = { vinValid: true, make: 'Seat', model: 'Leon', years: [1986, 2016] };

let token: string;

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('JWT_SECRET', 'test-secret');
  vi.stubGlobal('fetch', vi.fn());
  token = jwt.sign({ sub: 'user-1' }, process.env.JWT_SECRET as string);
  vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
});

function mockFetch(ok: boolean, data?: object) {
  vi.mocked(fetch).mockResolvedValue({
    ok,
    json: async () => data ?? autoDevSuccess,
  } as Response);
}

describe('VIN routes — unauthenticated', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app).get(`/vin/${VALID_VIN}`);
    expect(res.status).toBe(401);
  });
});

describe('GET /vin/:vin', () => {
  it('returns 400 when VIN is not 17 characters', async () => {
    const res = await request(app).get('/vin/SHORTVIN').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VIN must be exactly 17 characters');
  });

  it('returns 404 when the auto.dev API returns a non-ok response', async () => {
    mockFetch(false);
    const res = await request(app).get(`/vin/${VALID_VIN}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('VIN not found');
  });

  it('returns 404 when vinValid is false', async () => {
    mockFetch(true, { vinValid: false, make: '', model: '', years: [] });
    const res = await request(app).get(`/vin/${VALID_VIN}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('VIN not found');
  });

  it('returns 404 when make is not found in the database', async () => {
    mockFetch(true);
    vi.mocked(prisma.make.findFirst).mockResolvedValue(null);

    const res = await request(app).get(`/vin/${VALID_VIN}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Make not found in database');
  });

  it('returns 200 with full result when make and model are both found', async () => {
    mockFetch(true);
    vi.mocked(prisma.make.findFirst).mockResolvedValue(mockMake);
    vi.mocked(prisma.model.findFirst).mockResolvedValue(mockModel);

    const res = await request(app).get(`/vin/${VALID_VIN}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      year: 2016,
      makeId: 109,
      makeName: 'Seat',
      modelId: 2821,
      modelName: 'Leon',
    });
  });

  it('returns 200 with null modelId when model is not in the database', async () => {
    mockFetch(true);
    vi.mocked(prisma.make.findFirst).mockResolvedValue(mockMake);
    vi.mocked(prisma.model.findFirst).mockResolvedValue(null);

    const res = await request(app).get(`/vin/${VALID_VIN}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      year: 2016,
      makeId: 109,
      makeName: 'Seat',
      modelId: null,
      modelName: null,
    });
  });

  it('returns 200 using the most recent year when years array has multiple entries', async () => {
    mockFetch(true, { vinValid: true, make: 'Seat', model: 'Leon', years: [1986, 2016] });
    vi.mocked(prisma.make.findFirst).mockResolvedValue(mockMake);
    vi.mocked(prisma.model.findFirst).mockResolvedValue(mockModel);

    const res = await request(app).get(`/vin/${VALID_VIN}`).set('Authorization', `Bearer ${token}`);
    expect(res.body.year).toBe(2016);
  });

  it('returns 500 when an unexpected error occurs', async () => {
    mockFetch(true);
    vi.mocked(prisma.make.findFirst).mockRejectedValue(new Error('DB connection lost'));

    const res = await request(app).get(`/vin/${VALID_VIN}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(500);
  });
});
