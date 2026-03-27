import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { API_ROUTES } from '../constants/api';
import type { Vehicle } from '../types/vehicle.types';
import type { VehicleFormData } from '../schemas/vehicle.schema';

async function createVehicle(data: VehicleFormData): Promise<Vehicle> {
  const response = await api.post<Vehicle>(API_ROUTES.VEHICLES.LIST, data);
  return response.data;
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}
