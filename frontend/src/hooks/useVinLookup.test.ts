import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { useVinLookup } from './useVinLookup';

vi.mock('../api/axios', () => ({
  default: { get: vi.fn(), interceptors: { request: { use: vi.fn() } } },
}));

import api from '../api/axios';

const mockResult = {
  year: 2016,
  makeId: 109,
  makeName: 'Seat',
  modelId: 2821,
  modelName: 'Leon',
};

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return {
    wrapper: ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useVinLookup', () => {
  it('calls the VIN API with the provided VIN', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockResult });
    const { wrapper } = makeWrapper();

    const { result } = renderHook(() => useVinLookup(), { wrapper });

    await act(async () => {
      result.current.mutate('VSSZZZ5FZGR117755');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.get).toHaveBeenCalledWith('/vin/VSSZZZ5FZGR117755');
    expect(result.current.data).toEqual(mockResult);
  });

  it('exposes error state when the API call fails', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('Not found'));
    const { wrapper } = makeWrapper();

    const { result } = renderHook(() => useVinLookup(), { wrapper });

    await act(async () => {
      result.current.mutate('VSSZZZ5FZGR117755');
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
