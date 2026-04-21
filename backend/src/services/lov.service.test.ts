import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMakes, getModelsByMake } from './lov.service';

vi.mock('../prisma/client', () => ({
  default: {
    make: { findMany: vi.fn() },
    model: { findMany: vi.fn() },
  },
}));

import prisma from '../prisma/client';

const mockMakes = [
  { id: 1, name: 'Audi' },
  { id: 2, name: 'BMW' },
];

const mockModels = [
  { id: 1, name: 'A3', makeId: 1 },
  { id: 2, name: 'A4', makeId: 1 },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getMakes', () => {
  it('returns all makes ordered by name', async () => {
    vi.mocked(prisma.make.findMany).mockResolvedValue(mockMakes);

    const result = await getMakes();

    expect(result).toEqual(mockMakes);
    expect(prisma.make.findMany).toHaveBeenCalledWith({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    });
  });
});

describe('getModelsByMake', () => {
  it('returns models for the given makeId ordered by name', async () => {
    vi.mocked(prisma.model.findMany).mockResolvedValue(mockModels);

    const result = await getModelsByMake(1);

    expect(result).toEqual(mockModels);
    expect(prisma.model.findMany).toHaveBeenCalledWith({
      where: { makeId: 1 },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    });
  });
});
