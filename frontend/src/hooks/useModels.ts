import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { API_ROUTES } from '../constants/api';
import type { Model } from '../types/vehicle.types';

async function fetchModels(makeId: number): Promise<Model[]> {
  const response = await api.get<Model[]>(API_ROUTES.LOV.MODELS(makeId));
  return response.data;
}

export function useModels(makeId: number | null) {
  return useQuery({
    queryKey: ['models', makeId],
    queryFn: () => fetchModels(makeId!),
    enabled: makeId !== null && makeId > 0,
    staleTime: Infinity,
  });
}
