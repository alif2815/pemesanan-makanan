import * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'default' | 'sm' | 'lg';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', size = 'default', variant = 'default', ...props }, ref) => {
    let baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer';
    
    let variantStyles = '';
    if (variant === 'default') {
      variantStyles = 'bg-black text-white hover:bg-black/90 shadow dark:bg-white dark:text-black dark:hover:bg-white/90';
    } else if (variant === 'destructive') {
      variantStyles = 'bg-red-600 text-white hover:bg-red-700 shadow-sm';
    } else if (variant === 'outline') {
      variantStyles = 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 shadow-sm';
    } else if (variant === 'secondary') {
      variantStyles = 'bg-gray-100 text-gray-900 hover:bg-gray-200 shadow-sm';
    } else if (variant === 'ghost') {
      variantStyles = 'hover:bg-gray-100 hover:text-gray-900';
    } else if (variant === 'link') {
      variantStyles = 'text-blue-600 underline-offset-4 hover:underline';
    }

    let sizeStyles = '';
    if (size === 'default') {
      sizeStyles = 'h-10 px-4 py-2 text-sm';
    } else if (size === 'sm') {
      sizeStyles = 'h-9 rounded-md px-3 text-xs';
    } else if (size === 'lg') {
      sizeStyles = 'h-11 rounded-md px-8 text-base';
    }

    return (
      <button
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
