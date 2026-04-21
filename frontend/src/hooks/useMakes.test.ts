import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { useMakes } from './useMakes';

vi.mock('../api/axios', () => ({
  default: { get: vi.fn(), interceptors: { request: { use: vi.fn() } } },
}));

import api from '../api/axios';

const mockMakes = [
  { id: 1, name: 'Audi' },
  { id: 2, name: 'BMW' },
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

describe('useMakes', () => {
  it('fetches makes from the API', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockMakes });
    const { wrapper } = makeWrapper();

    const { result } = renderHook(() => useMakes(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.get).toHaveBeenCalledWith('/lov/makes');
    expect(result.current.data).toEqual(mockMakes);
  });

  it('exposes error state when the API call fails', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('Network error'));
    const { wrapper } = makeWrapper();

    const { result } = renderHook(() => useMakes(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
