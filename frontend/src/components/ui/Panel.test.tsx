import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Panel } from './Panel';

describe('Panel', () => {
  it('renders children', () => {
    render(
      <Panel>
        <p>Content</p>
      </Panel>,
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies surface background class', () => {
    render(
      <Panel>
        <p>Content</p>
      </Panel>,
    );
    expect(screen.getByText('Content').parentElement).toHaveClass('bg-surface');
  });
});
