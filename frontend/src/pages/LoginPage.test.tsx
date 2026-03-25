import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError } from 'axios';
import { renderWithProviders } from '../test/render-with-providers';
import { LoginPage } from './LoginPage';

vi.mock('../api/axios', () => ({
  default: {
    get: vi.fn().mockRejectedValue(new Error('no session')),
    post: vi.fn(),
    interceptors: { request: { use: vi.fn() } },
  },
}));

import api from '../api/axios';

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  vi.mocked(api.get).mockRejectedValue(new Error('no session'));
});

describe('LoginPage', () => {
  it('renders email, password fields and submit button', async () => {
    renderWithProviders(<LoginPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });
  });

  it('shows validation errors when submitted empty', async () => {
    renderWithProviders(<LoginPage />);
    await waitFor(() => screen.getByRole('button', { name: /sign in/i }));

    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email')).toBeInTheDocument();
    });
  });

  it('calls login API with form values on valid submit', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: {
        token: 'tok',
        user: {
          id: '1',
          email: 'user@test.com',
          name: null,
          googleId: null,
          createdAt: '',
          updatedAt: '',
        },
      },
    });

    renderWithProviders(<LoginPage />);
    await waitFor(() => screen.getByLabelText('Email'));

    await userEvent.type(screen.getByLabelText('Email'), 'user@test.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'user@test.com',
        password: 'password123',
      });
    });
  });

  it('shows API error message on failed login', async () => {
    const error = new AxiosError('Unauthorized');
    error.response = { data: { error: 'Invalid email or password' } } as AxiosError['response'];
    vi.mocked(api.post).mockRejectedValue(error);

    renderWithProviders(<LoginPage />);
    await waitFor(() => screen.getByLabelText('Email'));

    await userEvent.type(screen.getByLabelText('Email'), 'user@test.com');
    await userEvent.type(screen.getByLabelText('Password'), 'wrongpassword');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });
  });
});
