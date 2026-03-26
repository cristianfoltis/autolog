import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageLayout } from './PageLayout';

describe('PageLayout', () => {
  it('renders children', () => {
    render(
      <PageLayout>
        <p>Content</p>
      </PageLayout>,
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies background class', () => {
    render(
      <PageLayout>
        <p>Content</p>
      </PageLayout>,
    );
    expect(screen.getByText('Content').parentElement).toHaveClass('bg-background');
  });

  it('applies full screen height class', () => {
    render(
      <PageLayout>
        <p>Content</p>
      </PageLayout>,
    );
    expect(screen.getByText('Content').parentElement).toHaveClass('min-h-screen');
  });
});
