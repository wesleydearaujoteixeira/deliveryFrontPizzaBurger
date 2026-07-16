import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          className={`rounded-xl border bg-white px-4 py-3 text-sm outline-none
            transition-colors placeholder:text-zinc-400
            focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20
            dark:bg-surface-dark-2 dark:text-zinc-100
            ${error ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-700'} ${className}`}
          {...props}
        />
        {error && <span role="alert" className="text-xs text-red-500">{error}</span>}
      </div>
    );
  },
);
Input.displayName = 'Input';
