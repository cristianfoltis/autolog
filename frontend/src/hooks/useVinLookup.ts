import { useMutation } from '@tanstack/react-query';
import api from '../api/axios';
import { API_ROUTES } from '../constants/api';

export interface VinLookupResult {
  year: number;
  makeId: number;
  makeName: string;
  modelId: number | null;
  modelName: string | null;
}

async function lookupVin(vin: string): Promise<VinLookupResult> {
  const response = await api.get<VinLookupResult>(API_ROUTES.VIN(vin));
  return response.data;
}

export function useVinLookup() {
  return useMutation({ mutationFn: lookupVin });
}
