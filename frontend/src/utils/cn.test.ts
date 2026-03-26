import { describe, it, expect } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
  it('returns a single class unchanged', () => {
    expect(cn('bg-brand')).toBe('bg-brand');
  });

  it('joins multiple classes', () => {
    expect(cn('text-sm', 'font-medium')).toBe('text-sm font-medium');
  });

  it('ignores falsy values', () => {
    expect(cn('text-sm', false, undefined, null, 'font-medium')).toBe('text-sm font-medium');
  });

  it('applies conditional classes when condition is true', () => {
    expect(cn('text-sm', true && 'font-bold')).toBe('text-sm font-bold');
  });

  it('skips conditional classes when condition is false', () => {
    expect(cn('text-sm', false && 'font-bold')).toBe('text-sm');
  });

  it('merges conflicting tailwind classes, keeping the last one', () => {
    expect(cn('bg-brand', 'bg-error')).toBe('bg-error');
  });

  it('merges conflicting text color classes', () => {
    expect(cn('text-brand', 'text-error')).toBe('text-error');
  });
});
