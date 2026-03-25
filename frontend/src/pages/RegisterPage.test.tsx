import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError } from 'axios';
import { renderWithProviders } from '../test/render-with-providers';
import { RegisterPage } from './RegisterPage';

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

describe('RegisterPage', () => {
  it('renders all form fields and submit button', async () => {
    renderWithProviders(<RegisterPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('Full name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });
  });

  it('shows name validation error', async () => {
    renderWithProviders(<RegisterPage />);
    await waitFor(() => screen.getByLabelText('Full name'));

    await userEvent.type(screen.getByLabelText('Full name'), 'A');
    await userEvent.type(screen.getByLabelText('Email'), 'user@test.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.type(screen.getByLabelText('Confirm password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument();
    });
  });

  it('shows email validation error', async () => {
    renderWithProviders(<RegisterPage />);
    await waitFor(() => screen.getByLabelText('Full name'));

    await userEvent.type(screen.getByLabelText('Full name'), 'Test User');
    await userEvent.type(screen.getByLabelText('Email'), 'not-an-email');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.type(screen.getByLabelText('Confirm password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email')).toBeInTheDocument();
    });
  });

  it('shows password validation error', async () => {
    renderWithProviders(<RegisterPage />);
    await waitFor(() => screen.getByLabelText('Full name'));

    await userEvent.type(screen.getByLabelText('Full name'), 'Test User');
    await userEvent.type(screen.getByLabelText('Email'), 'user@test.com');
    await userEvent.type(screen.getByLabelText('Password'), 'short');
    await userEvent.type(screen.getByLabelText('Confirm password'), 'short');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });
  });

  it('shows password mismatch error', async () => {
    renderWithProviders(<RegisterPage />);
    await waitFor(() => screen.getByLabelText('Full name'));

    await userEvent.type(screen.getByLabelText('Full name'), 'Test User');
    await userEvent.type(screen.getByLabelText('Email'), 'user@test.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.type(screen.getByLabelText('Confirm password'), 'different');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  it('calls register API without confirmPassword on valid submit', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: {
        token: 'tok',
        user: {
          id: '1',
          email: 'user@test.com',
          name: 'Test User',
          googleId: null,
          createdAt: '',
          updatedAt: '',
        },
      },
    });

    renderWithProviders(<RegisterPage />);
    await waitFor(() => screen.getByLabelText('Full name'));

    await userEvent.type(screen.getByLabelText('Full name'), 'Test User');
    await userEvent.type(screen.getByLabelText('Email'), 'user@test.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.type(screen.getByLabelText('Confirm password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/register', {
        name: 'Test User',
        email: 'user@test.com',
        password: 'password123',
      });
    });
  });

  it('shows API error message on failed registration', async () => {
    const error = new AxiosError('Conflict');
    error.response = { data: { error: 'Email already in use' } } as AxiosError['response'];
    vi.mocked(api.post).mockRejectedValue(error);

    renderWithProviders(<RegisterPage />);
    await waitFor(() => screen.getByLabelText('Full name'));

    await userEvent.type(screen.getByLabelText('Full name'), 'Test User');
    await userEvent.type(screen.getByLabelText('Email'), 'existing@test.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.type(screen.getByLabelText('Confirm password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText('Email already in use')).toBeInTheDocument();
    });
  });
});
