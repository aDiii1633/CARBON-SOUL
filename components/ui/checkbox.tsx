import * as React from 'react';
import { twMerge } from 'tailwind-merge';

export type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>;

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        className={twMerge(
          'h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-600 cursor-pointer accent-green-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
