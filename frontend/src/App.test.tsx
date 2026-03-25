import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

vi.mock('./router', () => ({
  AppRouter: () => <div data-testid="app-router">Router</div>,
}));

describe('App', () => {
  it('renders the app router', () => {
    render(<App />);
    expect(screen.getByTestId('app-router')).toBeInTheDocument();
  });
});
