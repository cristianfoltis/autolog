import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../index';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

vi.mock('../prisma/client', () => ({
  default: {
    user: { findUnique: vi.fn() },
  },
}));

vi.mock('../services/vehicle.service', () => ({
  getUserVehicles: vi.fn(),
  getVehicleById: vi.fn(),
  createVehicle: vi.fn(),
  updateVehicle: vi.fn(),
  deleteVehicle: vi.fn(),
}));

import prisma from '../prisma/client';
import {
  getUserVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from '../services/vehicle.service';

const mockUser = {
  id: 'user-1',
  email: 'test@test.com',
  name: 'Test User',
  passwordHash: null,
  googleId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockVehicle = {
  id: 'vehicle-1',
  plate: 'B-123-ABC',
  year: 2020,
  vin: null,
  mileage: 50000,
  mileageUnit: 'km',
  make: { id: 1, name: 'Audi' },
  model: { id: 1, name: 'A4' },
  createdAt: new Date(),
  updatedAt: new Date(),
};

let token: string;

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('JWT_SECRET', 'test-secret');
  token = jwt.sign({ sub: 'user-1' }, process.env.JWT_SECRET as string);
  vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
});

describe('Vehicle routes — unauthenticated', () => {
  it('returns 401 on GET /vehicles without token', async () => {
    const res = await request(app).get('/vehicles');
    expect(res.status).toBe(401);
  });

  it('returns 401 on POST /vehicles without token', async () => {
    const res = await request(app).post('/vehicles').send({});
    expect(res.status).toBe(401);
  });
});

describe('GET /vehicles', () => {
  it('returns 200 with list of vehicles', async () => {
    vi.mocked(getUserVehicles).mockResolvedValue([mockVehicle]);

    const res = await request(app).get('/vehicles').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

describe('GET /vehicles/:id', () => {
  it('returns 200 with vehicle when found', async () => {
    vi.mocked(getVehicleById).mockResolvedValue(mockVehicle);

    const res = await request(app)
      .get('/vehicles/vehicle-1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.plate).toBe('B-123-ABC');
  });

  it('returns 404 when vehicle not found', async () => {
    vi.mocked(getVehicleById).mockResolvedValue(null);

    const res = await request(app)
      .get('/vehicles/nonexistent')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Vehicle not found');
  });
});

describe('POST /vehicles', () => {
  const validBody = {
    plate: 'B-123-ABC',
    year: 2020,
    mileage: 50000,
    makeId: 1,
    modelId: 1,
  };

  it('returns 201 with created vehicle', async () => {
    vi.mocked(createVehicle).mockResolvedValue(mockVehicle);

    const res = await request(app)
      .post('/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.plate).toBe('B-123-ABC');
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send({ plate: 'B-123-ABC' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('returns 409 when plate already exists', async () => {
    vi.mocked(createVehicle).mockRejectedValue(
      new PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '5.0.0',
      }),
    );

    const res = await request(app)
      .post('/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send(validBody);

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('A vehicle with this plate already exists');
  });

  it('re-throws non-P2002 errors on POST', async () => {
    vi.mocked(createVehicle).mockRejectedValue(new Error('Database connection lost'));

    const res = await request(app)
      .post('/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send(validBody);

    expect(res.status).toBe(500);
  });
});

describe('PUT /vehicles/:id', () => {
  it('returns 200 with updated vehicle', async () => {
    vi.mocked(updateVehicle).mockResolvedValue({ ...mockVehicle, mileage: 60000 });

    const res = await request(app)
      .put('/vehicles/vehicle-1')
      .set('Authorization', `Bearer ${token}`)
      .send({ mileage: 60000 });

    expect(res.status).toBe(200);
    expect(res.body.mileage).toBe(60000);
  });

  it('returns 404 when vehicle not found', async () => {
    vi.mocked(updateVehicle).mockResolvedValue(null);

    const res = await request(app)
      .put('/vehicles/nonexistent')
      .set('Authorization', `Bearer ${token}`)
      .send({ mileage: 60000 });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Vehicle not found');
  });

  it('re-throws non-P2002 errors on PUT', async () => {
    vi.mocked(updateVehicle).mockRejectedValue(new Error('Database connection lost'));

    const res = await request(app)
      .put('/vehicles/vehicle-1')
      .set('Authorization', `Bearer ${token}`)
      .send({ mileage: 60000 });

    expect(res.status).toBe(500);
  });

  it('returns 409 when updated plate already exists', async () => {
    vi.mocked(updateVehicle).mockRejectedValue(
      new PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '5.0.0',
      }),
    );

    const res = await request(app)
      .put('/vehicles/vehicle-1')
      .set('Authorization', `Bearer ${token}`)
      .send({ plate: 'TAKEN-PLATE' });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('A vehicle with this plate already exists');
  });
});

describe('DELETE /vehicles/:id', () => {
  it('returns 204 on successful delete', async () => {
    vi.mocked(deleteVehicle).mockResolvedValue(true);

    const res = await request(app)
      .delete('/vehicles/vehicle-1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);
  });

  it('returns 404 when vehicle not found', async () => {
    vi.mocked(deleteVehicle).mockResolvedValue(false);

    const res = await request(app)
      .delete('/vehicles/nonexistent')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Vehicle not found');
  });
});
