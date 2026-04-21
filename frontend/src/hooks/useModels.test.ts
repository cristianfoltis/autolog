import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { useModels } from './useModels';

vi.mock('../api/axios', () => ({
  default: { get: vi.fn(), interceptors: { request: { use: vi.fn() } } },
}));

import api from '../api/axios';

const mockModels = [{ id: 1, name: 'A4' }];

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

describe('useModels', () => {
  it('fetches models for a given makeId', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockModels });
    const { wrapper } = makeWrapper();

    const { result } = renderHook(() => useModels(1), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.get).toHaveBeenCalledWith('/lov/models?makeId=1');
    expect(result.current.data).toEqual(mockModels);
  });

  it('does not fetch when makeId is null', () => {
    const { wrapper } = makeWrapper();

    const { result } = renderHook(() => useModels(null), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
    expect(api.get).not.toHaveBeenCalled();
  });

  it('does not fetch when makeId is 0', () => {
    const { wrapper } = makeWrapper();

    const { result } = renderHook(() => useModels(0), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
    expect(api.get).not.toHaveBeenCalled();
  });
});
