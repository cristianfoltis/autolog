import type { SelectHTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  readonly label: string;
  readonly error?: string;
  readonly children: ReactNode;
}

export const SelectField = forwardRef<HTMLSelectElement, Props>(function SelectField(
  { label, error, id, children, ...rest },
  ref,
) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-text-primary">
        {label}
      </label>
      <select
        ref={ref}
        id={id}
        {...rest}
        className={cn(
          'w-full rounded-lg border px-3 py-2.5',
          'text-sm bg-white',
          'outline-none transition-colors',
          'focus:ring-2 focus:ring-brand focus:border-transparent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error ? 'border-error' : 'border-border',
        )}
      >
        {children}
      </select>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
});
