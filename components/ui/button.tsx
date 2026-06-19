import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={twMerge(
          clsx(
            'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none',
            {
              'neo-flat text-foreground hover:opacity-90 active:neo-pressed active:shadow-none duration-200': variant === 'default',
              'bg-destructive text-white shadow-md hover:bg-red-600 active:scale-95 duration-200': variant === 'destructive',
              'border border-border bg-transparent hover:neo-pressed text-foreground': variant === 'outline',
              'neo-flat text-primary font-bold hover:neo-pressed active:neo-pressed duration-200': variant === 'secondary',
              'hover:neo-pressed text-muted-foreground duration-200': variant === 'ghost',
              'text-primary underline-offset-4 hover:underline': variant === 'link',
              'h-10 px-4 py-2': size === 'default',
              'h-9 px-3 rounded-md': size === 'sm',
              'h-11 px-8 rounded-md': size === 'lg',
              'h-10 w-10': size === 'icon',
            }
          ),
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
