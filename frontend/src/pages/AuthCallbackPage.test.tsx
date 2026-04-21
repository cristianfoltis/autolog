import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from '../test/render-with-providers';
import { AuthCallbackPage } from './AuthCallbackPage';

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

describe('AuthCallbackPage', () => {
  it('shows signing in message while processing', () => {
    vi.mocked(api.get).mockReturnValue(new Promise(() => {}));

    renderWithProviders(<AuthCallbackPage />, { initialRoute: '/auth/callback?token=abc123' });

    expect(screen.getByText('Signing you in...')).toBeInTheDocument();
  });

  it('redirects to /dashboard on successful token validation', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { id: 'u-1', email: 'user@test.com', name: 'Test' },
    });

    renderWithProviders(
      <Routes>
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
      </Routes>,
      { initialRoute: '/auth/callback?token=abc123' },
    );

    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
  });

  it('redirects to /login when token is missing', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/login" element={<div>Login</div>} />
      </Routes>,
      { initialRoute: '/auth/callback' },
    );

    expect(await screen.findByText('Login')).toBeInTheDocument();
  });

  it('redirects to /login when API call fails', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('Unauthorized'));

    renderWithProviders(
      <Routes>
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/login" element={<div>Login</div>} />
      </Routes>,
      { initialRoute: '/auth/callback?token=bad-token' },
    );

    await waitFor(() => expect(screen.getByText('Login')).toBeInTheDocument());
  });
});
