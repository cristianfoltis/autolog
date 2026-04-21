import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { API_ROUTES } from '../constants/api';
import type { Vehicle } from '../types/vehicle.types';
import type { VehicleFormData } from '../schemas/vehicle.schema';

interface UpdateVehicleArgs {
  id: string;
  data: Partial<VehicleFormData>;
}

async function updateVehicle({ id, data }: UpdateVehicleArgs): Promise<Vehicle> {
  const response = await api.put<Vehicle>(API_ROUTES.VEHICLES.DETAIL(id), data);
  return response.data;
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}
