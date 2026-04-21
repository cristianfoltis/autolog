import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { API_ROUTES } from '../constants/api';
import type { Vehicle } from '../types/vehicle.types';

async function fetchVehicles(): Promise<Vehicle[]> {
  const response = await api.get<Vehicle[]>(API_ROUTES.VEHICLES.LIST);
  return response.data;
}

export function useVehicles() {
  return useQuery({ queryKey: ['vehicles'], queryFn: fetchVehicles });
}
