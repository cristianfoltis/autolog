import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormField } from './FormField';

describe('FormField', () => {
  it('renders the label', () => {
    render(<FormField id="email" label="Email" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('associates label with input via id', () => {
    render(<FormField id="email" label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renders input with correct type', () => {
    render(<FormField id="password" label="Password" type="password" />);
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
  });

  it('renders error message when error prop is provided', () => {
    render(<FormField id="email" label="Email" error="Please enter a valid email" />);
    expect(screen.getByText('Please enter a valid email')).toBeInTheDocument();
  });

  it('does not render error message when error prop is absent', () => {
    render(<FormField id="email" label="Email" />);
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
  });

  it('applies error border class when error is present', () => {
    render(<FormField id="email" label="Email" error="Required" />);
    expect(screen.getByLabelText('Email')).toHaveClass('border-error');
  });

  it('applies normal border class when no error', () => {
    render(<FormField id="email" label="Email" />);
    expect(screen.getByLabelText('Email')).toHaveClass('border-border');
  });
});
