import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { Spinner } from './Spinner';

interface Props {
  readonly children: ReactNode;
  readonly type?: 'button' | 'submit';
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly variant?: 'primary' | 'outline';
  readonly onClick?: () => void;
}

const variants = {
  primary: 'bg-brand text-white hover:bg-brand-hover',
  outline: 'border border-border text-text-primary hover:bg-gray-50',
};

export function Button({
  children,
  type = 'button',
  disabled,
  loading,
  variant = 'primary',
  onClick,
}: Props) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        'w-full flex items-center justify-center gap-2',
        'rounded-lg py-2.5',
        'text-sm font-medium',
        'transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
      )}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}
