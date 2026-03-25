import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, act } from '@testing-library/react';
import { renderWithProviders } from '../test/render-with-providers';
import { useAuth } from './AuthContext';

vi.mock('../api/axios', () => ({
  default: {
    get: vi.fn(),
    interceptors: { request: { use: vi.fn() } },
  },
}));

import api from '../api/axios';

function AuthConsumer() {
  const { user, isAuthenticated } = useAuth();
  return (
    <div>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="user">{user?.email ?? 'none'}</span>
    </div>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe('AuthProvider', () => {
  it('starts unauthenticated when no token in localStorage', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('no token'));

    renderWithProviders(<AuthConsumer />);

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });
  });

  it('restores session when valid token exists in localStorage', async () => {
    localStorage.setItem('autolog_token', 'valid-token');
    vi.mocked(api.get).mockResolvedValue({ data: { email: 'user@test.com' } });

    renderWithProviders(<AuthConsumer />);

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('user@test.com');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });
  });

  it('clears token from localStorage when session restore fails', async () => {
    localStorage.setItem('autolog_token', 'expired-token');
    vi.mocked(api.get).mockRejectedValue(new Error('Unauthorized'));

    renderWithProviders(<AuthConsumer />);

    await waitFor(() => {
      expect(localStorage.getItem('autolog_token')).toBeNull();
    });
  });
});

describe('useAuth', () => {
  it('throws when used outside AuthProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      const { unmount } = renderWithProviders(<AuthConsumer />);
      unmount();
    }).not.toThrow();

    consoleError.mockRestore();
  });

  it('login stores token and updates user', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('no token'));

    function LoginTrigger() {
      const { login, isAuthenticated } = useAuth();
      return (
        <div>
          <span data-testid="authenticated">{String(isAuthenticated)}</span>
          <button
            onClick={() =>
              login({
                token: 'new-token',
                user: {
                  id: '1',
                  email: 'a@b.com',
                  name: null,
                  googleId: null,
                  createdAt: '',
                  updatedAt: '',
                },
              })
            }
          >
            login
          </button>
        </div>
      );
    }

    renderWithProviders(<LoginTrigger />);
    await waitFor(() => expect(screen.getByTestId('authenticated')).toHaveTextContent('false'));

    act(() => screen.getByRole('button').click());

    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    expect(localStorage.getItem('autolog_token')).toBe('new-token');
  });

  it('logout clears token and user', async () => {
    localStorage.setItem('autolog_token', 'token');
    vi.mocked(api.get).mockResolvedValue({ data: { email: 'a@b.com' } });

    function LogoutTrigger() {
      const { logout, isAuthenticated } = useAuth();
      return (
        <div>
          <span data-testid="authenticated">{String(isAuthenticated)}</span>
          <button onClick={logout}>logout</button>
        </div>
      );
    }

    renderWithProviders(<LogoutTrigger />);
    await waitFor(() => expect(screen.getByTestId('authenticated')).toHaveTextContent('true'));

    act(() => screen.getByRole('button').click());

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(localStorage.getItem('autolog_token')).toBeNull();
  });
});
