import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../test/render-with-providers';
import { DashboardPage } from './DashboardPage';

vi.mock('../context/AuthContext', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../context/AuthContext')>();
  return { ...actual, useAuth: vi.fn() };
});

import { useAuth } from '../context/AuthContext';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('DashboardPage', () => {
  it('renders the dashboard heading', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'u-1', email: 'test@test.com', name: 'Test User' },
      token: 'tok',
      login: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: true,
    } as any);

    renderWithProviders(<DashboardPage />);

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('shows the user name in the welcome message', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'u-1', email: 'test@test.com', name: 'Test User' },
      token: 'tok',
      login: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: true,
    } as any);

    renderWithProviders(<DashboardPage />);

    expect(screen.getByText('Welcome, Test User')).toBeInTheDocument();
  });

  it('falls back to email when name is absent', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'u-1', email: 'test@test.com', name: null },
      token: 'tok',
      login: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: true,
    } as any);

    renderWithProviders(<DashboardPage />);

    expect(screen.getByText('Welcome, test@test.com')).toBeInTheDocument();
  });

  it('calls logout when Sign out is clicked', () => {
    const logout = vi.fn();
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'u-1', email: 'test@test.com', name: 'Test User' },
      token: 'tok',
      login: vi.fn(),
      logout,
      isAuthenticated: true,
    } as any);

    renderWithProviders(<DashboardPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(logout).toHaveBeenCalled();
  });
});
