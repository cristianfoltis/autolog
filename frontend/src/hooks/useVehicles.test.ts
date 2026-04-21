import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { useVehicles } from './useVehicles';

vi.mock('../api/axios', () => ({
  default: { get: vi.fn(), interceptors: { request: { use: vi.fn() } } },
}));

import api from '../api/axios';

const mockVehicles = [
  {
    id: 'v-1',
    plate: 'B-123-ABC',
    year: 2020,
    make: { id: 1, name: 'Audi' },
    model: { id: 1, name: 'A4' },
  },
];

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return {
    queryClient,
    wrapper: ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useVehicles', () => {
  it('fetches vehicles from the API', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockVehicles });
    const { wrapper } = makeWrapper();

    const { result } = renderHook(() => useVehicles(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.get).toHaveBeenCalledWith('/vehicles');
    expect(result.current.data).toEqual(mockVehicles);
  });

  it('exposes error state when the API call fails', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('Network error'));
    const { wrapper } = makeWrapper();

    const { result } = renderHook(() => useVehicles(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
