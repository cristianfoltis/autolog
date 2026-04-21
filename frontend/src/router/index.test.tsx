import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    createBrowserRouter: vi.fn().mockReturnValue({ id: 'mock-router' }),
    RouterProvider: vi.fn(({ router }: ComponentProps<typeof actual.RouterProvider>) => (
      <div data-testid="router-provider" data-router-id={(router as any).id} />
    )),
  };
});

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppRouter } from './index';

describe('AppRouter', () => {
  it('renders RouterProvider', () => {
    render(<AppRouter />);
    expect(screen.getByTestId('router-provider')).toBeInTheDocument();
  });

  it('passes the router created by createBrowserRouter to RouterProvider', () => {
    render(<AppRouter />);
    expect(screen.getByTestId('router-provider')).toHaveAttribute('data-router-id', 'mock-router');
  });

  it('creates the router with the expected routes', () => {
    render(<AppRouter />);
    const routes = vi.mocked(createBrowserRouter).mock.calls[0][0];
    const paths = routes.map((r: { path: string }) => r.path);
    expect(paths).toEqual(['/', '/login', '/register', '/auth/callback', '/dashboard']);
  });

  it('passes the created router to RouterProvider', () => {
    render(<AppRouter />);
    const receivedRouter = vi.mocked(RouterProvider).mock.calls[0][0].router;
    expect(receivedRouter).toEqual({ id: 'mock-router' });
  });
});
