import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { useDeleteVehicle } from './useDeleteVehicle';

vi.mock('../api/axios', () => ({
  default: { delete: vi.fn(), interceptors: { request: { use: vi.fn() } } },
}));

import api from '../api/axios';

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

describe('useDeleteVehicle', () => {
  it('deletes the vehicle via the API', async () => {
    vi.mocked(api.delete).mockResolvedValue({});
    const { wrapper } = makeWrapper();

    const { result } = renderHook(() => useDeleteVehicle(), { wrapper });

    await act(async () => {
      result.current.mutate('v-1');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.delete).toHaveBeenCalledWith('/vehicles/v-1');
  });

  it('invalidates the vehicles query on success', async () => {
    vi.mocked(api.delete).mockResolvedValue({});
    const { wrapper, queryClient } = makeWrapper();

    const { result } = renderHook(() => useDeleteVehicle(), { wrapper });

    await act(async () => {
      result.current.mutate('v-1');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['vehicles'] });
  });
});
