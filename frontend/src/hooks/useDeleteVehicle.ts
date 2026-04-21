import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { API_ROUTES } from '../constants/api';

async function deleteVehicle(id: string): Promise<void> {
  await api.delete(API_ROUTES.VEHICLES.DETAIL(id));
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}
