import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  readonly label: string;
  readonly error?: string;
}

export const FormField = forwardRef<HTMLInputElement, Props>(function FormField(
  { label, error, id, ...rest },
  ref,
) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-text-primary">
        {label}
      </label>
      <input
        ref={ref}
        id={id}
        {...rest}
        className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-text-muted focus:ring-2 focus:ring-brand focus:border-transparent ${
          error ? 'border-error' : 'border-border'
        }`}
      />
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
});
