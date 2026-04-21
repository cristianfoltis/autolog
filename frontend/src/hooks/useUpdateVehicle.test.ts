import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { useUpdateVehicle } from './useUpdateVehicle';

vi.mock('../api/axios', () => ({
  default: { put: vi.fn(), interceptors: { request: { use: vi.fn() } } },
}));

import api from '../api/axios';

const mockVehicle = { id: 'v-1', plate: 'B-999-XYZ', year: 2021 };

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

describe('useUpdateVehicle', () => {
  it('puts to the vehicle detail API with id and data', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: mockVehicle });
    const { wrapper } = makeWrapper();

    const { result } = renderHook(() => useUpdateVehicle(), { wrapper });

    await act(async () => {
      result.current.mutate({ id: 'v-1', data: { plate: 'B-999-XYZ' } });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.put).toHaveBeenCalledWith('/vehicles/v-1', { plate: 'B-999-XYZ' });
  });

  it('invalidates the vehicles query on success', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: mockVehicle });
    const { wrapper, queryClient } = makeWrapper();

    const { result } = renderHook(() => useUpdateVehicle(), { wrapper });

    await act(async () => {
      result.current.mutate({ id: 'v-1', data: { plate: 'B-999-XYZ' } });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['vehicles'] });
  });
});
