import { describe, it, expect } from 'vitest';
import { vehicleSchema } from './vehicle.schema';

const validData = {
  makeId: 1,
  modelId: 1,
  year: 2020,
  plate: 'B-123-ABC',
  mileage: 50000,
  mileageUnit: 'km' as const,
};

describe('vehicleSchema', () => {
  it('accepts valid data', () => {
    expect(vehicleSchema.safeParse(validData).success).toBe(true);
  });

  it('accepts optional vin', () => {
    const result = vehicleSchema.safeParse({ ...validData, vin: '1HGBH41JXMN109186' });
    expect(result.success).toBe(true);
  });

  it('rejects makeId of 0', () => {
    const result = vehicleSchema.safeParse({ ...validData, makeId: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects modelId of 0', () => {
    const result = vehicleSchema.safeParse({ ...validData, modelId: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects year below 1900', () => {
    const result = vehicleSchema.safeParse({ ...validData, year: 1800 });
    expect(result.success).toBe(false);
  });

  it('rejects empty plate', () => {
    const result = vehicleSchema.safeParse({ ...validData, plate: '' });
    expect(result.success).toBe(false);
  });

  it('rejects negative mileage', () => {
    const result = vehicleSchema.safeParse({ ...validData, mileage: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects invalid mileageUnit', () => {
    const result = vehicleSchema.safeParse({ ...validData, mileageUnit: 'miles' });
    expect(result.success).toBe(false);
  });

  it('accepts mi as mileageUnit', () => {
    const result = vehicleSchema.safeParse({ ...validData, mileageUnit: 'mi' });
    expect(result.success).toBe(true);
  });
});
