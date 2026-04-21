import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../index';

vi.mock('../services/lov.service', () => ({
  getMakes: vi.fn(),
  getModelsByMake: vi.fn(),
}));

import { getMakes, getModelsByMake } from '../services/lov.service';

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

describe('GET /lov/makes', () => {
  it('returns 200 with list of makes', async () => {
    vi.mocked(getMakes).mockResolvedValue(mockMakes);

    const res = await request(app).get('/lov/makes');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockMakes);
  });
});

describe('GET /lov/models', () => {
  it('returns 200 with models for a valid makeId', async () => {
    vi.mocked(getModelsByMake).mockResolvedValue(mockModels);

    const res = await request(app).get('/lov/models?makeId=1');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockModels);
    expect(getModelsByMake).toHaveBeenCalledWith(1);
  });

  it('returns 400 when makeId is missing', async () => {
    const res = await request(app).get('/lov/models');

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('returns 400 when makeId is not a number', async () => {
    const res = await request(app).get('/lov/models?makeId=abc');

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});
