import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getUserVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from './vehicle.service';

vi.mock('../prisma/client', () => ({
  default: {
    vehicle: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import prisma from '../prisma/client';

const mockVehicle = {
  id: 'vehicle-1',
  plate: 'B-123-ABC',
  year: 2020,
  vin: null,
  mileage: 50000,
  mileageUnit: 'km',
  makeId: 1,
  modelId: 1,
  userId: 'user-1',
  make: { id: 1, name: 'Audi' },
  model: { id: 1, name: 'A4' },
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getUserVehicles', () => {
  it('returns vehicles for the given user', async () => {
    vi.mocked(prisma.vehicle.findMany).mockResolvedValue([mockVehicle]);

    const result = await getUserVehicles('user-1');

    expect(result).toEqual([mockVehicle]);
    expect(prisma.vehicle.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1' } }),
    );
  });
});

describe('getVehicleById', () => {
  it('returns vehicle when it belongs to the user', async () => {
    vi.mocked(prisma.vehicle.findFirst).mockResolvedValue(mockVehicle);

    const result = await getVehicleById('vehicle-1', 'user-1');

    expect(result).toEqual(mockVehicle);
  });

  it('returns null when vehicle does not exist', async () => {
    vi.mocked(prisma.vehicle.findFirst).mockResolvedValue(null);

    const result = await getVehicleById('nonexistent', 'user-1');

    expect(result).toBeNull();
  });
});

describe('createVehicle', () => {
  it('creates and returns the vehicle', async () => {
    vi.mocked(prisma.vehicle.create).mockResolvedValue(mockVehicle);

    const result = await createVehicle('user-1', {
      plate: 'B-123-ABC',
      year: 2020,
      mileage: 50000,
      makeId: 1,
      modelId: 1,
    });

    expect(result).toEqual(mockVehicle);
    expect(prisma.vehicle.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: 'user-1' }) }),
    );
  });
});

describe('updateVehicle', () => {
  it('updates and returns the vehicle', async () => {
    vi.mocked(prisma.vehicle.findFirst).mockResolvedValue({ id: 'vehicle-1' } as any);
    vi.mocked(prisma.vehicle.update).mockResolvedValue({ ...mockVehicle, mileage: 60000 });

    const result = await updateVehicle('vehicle-1', 'user-1', { mileage: 60000 });

    expect(result?.mileage).toBe(60000);
  });

  it('returns null when vehicle does not exist', async () => {
    vi.mocked(prisma.vehicle.findFirst).mockResolvedValue(null);

    const result = await updateVehicle('nonexistent', 'user-1', { mileage: 60000 });

    expect(result).toBeNull();
    expect(prisma.vehicle.update).not.toHaveBeenCalled();
  });
});

describe('deleteVehicle', () => {
  it('deletes the vehicle and returns true', async () => {
    vi.mocked(prisma.vehicle.findFirst).mockResolvedValue({ id: 'vehicle-1' } as any);
    vi.mocked(prisma.vehicle.delete).mockResolvedValue(mockVehicle);

    const result = await deleteVehicle('vehicle-1', 'user-1');

    expect(result).toBe(true);
    expect(prisma.vehicle.delete).toHaveBeenCalledWith({ where: { id: 'vehicle-1' } });
  });

  it('returns false when vehicle does not exist', async () => {
    vi.mocked(prisma.vehicle.findFirst).mockResolvedValue(null);

    const result = await deleteVehicle('nonexistent', 'user-1');

    expect(result).toBe(false);
    expect(prisma.vehicle.delete).not.toHaveBeenCalled();
  });
});
