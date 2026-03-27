import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { API_ROUTES } from '../constants/api';
import type { Make } from '../types/vehicle.types';

async function fetchMakes(): Promise<Make[]> {
  const response = await api.get<Make[]>(API_ROUTES.LOV.MAKES);
  return response.data;
}

export function useMakes() {
  return useQuery({ queryKey: ['makes'], queryFn: fetchMakes, staleTime: Infinity });
}
