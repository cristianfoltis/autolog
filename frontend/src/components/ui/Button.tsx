import type { ReactNode } from 'react';

interface Props {
  readonly children: ReactNode;
  readonly type?: 'button' | 'submit';
  readonly disabled?: boolean;
  readonly variant?: 'primary' | 'outline';
  readonly onClick?: () => void;
}

export function Button({
  children,
  type = 'button',
  disabled,
  variant = 'primary',
  onClick,
}: Props) {
  const base =
    'w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-brand text-white hover:bg-brand-hover',
    outline: 'border border-border text-text-primary hover:bg-gray-50',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant]}`}
    >
      {children}
    </button>
  );
}
