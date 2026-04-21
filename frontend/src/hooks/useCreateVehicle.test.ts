import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { useCreateVehicle } from './useCreateVehicle';

vi.mock('../api/axios', () => ({
  default: { post: vi.fn(), interceptors: { request: { use: vi.fn() } } },
}));

import api from '../api/axios';

const mockVehicle = { id: 'v-1', plate: 'B-123-ABC', year: 2020 };
const formData = {
  makeId: 1,
  modelId: 1,
  year: 2020,
  plate: 'B-123-ABC',
  mileage: 0,
  mileageUnit: 'km' as const,
};

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  vi.spyOn(queryClient, 'invalidateQueries');
  return {
    queryClient,
    wrapper: ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useCreateVehicle', () => {
  it('posts to the vehicles API with the form data', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: mockVehicle });
    const { wrapper } = makeWrapper();

    const { result } = renderHook(() => useCreateVehicle(), { wrapper });

    await act(async () => {
      result.current.mutate(formData);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.post).toHaveBeenCalledWith('/vehicles', formData);
  });

  it('invalidates the vehicles query on success', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: mockVehicle });
    const { wrapper, queryClient } = makeWrapper();

    const { result } = renderHook(() => useCreateVehicle(), { wrapper });

    await act(async () => {
      result.current.mutate(formData);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['vehicles'] });
  });
});
