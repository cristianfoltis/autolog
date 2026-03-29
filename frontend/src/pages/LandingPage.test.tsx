import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from '../test/render-with-providers';
import { LandingPage } from './LandingPage';

vi.mock('../api/axios', () => ({
  default: {
    get: vi.fn(),
    interceptors: { request: { use: vi.fn() } },
  },
}));

import api from '../api/axios';

describe('LandingPage', () => {
  it('renders headline', () => {
    renderWithProviders(<LandingPage />);
    expect(screen.getByText(/know your cars/i)).toBeInTheDocument();
  });

  it('renders Sign in and Get started links', () => {
    renderWithProviders(<LandingPage />);
    const signInLinks = screen.getAllByRole('link', { name: /sign in/i });
    expect(signInLinks.length).toBeGreaterThan(0);
    expect(signInLinks[0]).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: /get started/i })).toHaveAttribute('href', '/register');
  });

  it('renders all three feature cards', () => {
    renderWithProviders(<LandingPage />);
    expect(screen.getByText('Track your fleet')).toBeInTheDocument();
    expect(screen.getByText('Service reminders')).toBeInTheDocument();
    expect(screen.getByText('Full history')).toBeInTheDocument();
  });

  it('renders footer with copyright', () => {
    renderWithProviders(<LandingPage />);
    expect(screen.getByText(/autolog/i, { selector: 'p' })).toBeInTheDocument();
  });

  it('redirects to /dashboard when already authenticated', async () => {
    localStorage.setItem('autolog_token', 'valid-token');
    vi.mocked(api.get).mockResolvedValue({ data: { email: 'user@test.com', name: 'Test' } });

    renderWithProviders(
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
      </Routes>,
    );

    await screen.findByText('Dashboard');
    expect(screen.queryByText(/know your cars/i)).not.toBeInTheDocument();
  });
});
