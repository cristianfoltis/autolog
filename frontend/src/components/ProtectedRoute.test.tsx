import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from '../test/render-with-providers';
import { ProtectedRoute } from './ProtectedRoute';

vi.mock('../api/axios', () => ({
  default: {
    get: vi.fn(),
    interceptors: { request: { use: vi.fn() } },
  },
}));

import api from '../api/axios';

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe('ProtectedRoute', () => {
  it('redirects to / when not authenticated', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('Unauthorized'));

    renderWithProviders(
      <Routes>
        <Route path="/" element={<div>Landing Page</div>} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          }
        />
      </Routes>,
      { initialRoute: '/dashboard' },
    );

    await waitFor(() => {
      expect(screen.getByText('Landing Page')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  it('renders children when authenticated', async () => {
    localStorage.setItem('autolog_token', 'valid-token');
    vi.mocked(api.get).mockResolvedValue({ data: { email: 'user@test.com' } });

    renderWithProviders(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });
});
