import { z } from 'zod';

const currentYear = new Date().getFullYear();

export const vehicleSchema = z.object({
  makeId: z.number().int().positive('Please select a make'),
  modelId: z.number().int().positive('Please select a model'),
  year: z
    .number({ invalid_type_error: 'Year must be a number' })
    .int()
    .min(1900, 'Year must be after 1900')
    .max(currentYear + 1, `Year cannot exceed ${currentYear + 1}`),
  plate: z.string().min(1, 'Plate is required'),
  vin: z.string().optional(),
  mileage: z
    .number({ invalid_type_error: 'Mileage must be a number' })
    .int()
    .min(0, 'Mileage cannot be negative'),
  mileageUnit: z.enum(['km', 'mi']),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;
