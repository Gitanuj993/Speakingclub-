/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  icon?: ReactNode;
  iconRight?: ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  iconRight,
  isLoading,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer rounded-xl active:scale-[0.98] min-h-[44px]';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5 min-h-[38px]',
    md: 'text-sm px-4.5 py-2 gap-2 min-h-[44px]',
    lg: 'text-base px-6 py-3 gap-2.5 min-h-[48px]',
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-[#E68A24] via-[#DE7D1C] to-[#C66A18] hover:from-[#DE7D1C] hover:to-[#B55D12] text-white font-semibold shadow-sm shadow-[#E68A24]/30 border border-[#D4AF65]/35 focus-visible:ring-[#E68A24]',
    secondary:
      'bg-[#F5EBDD] hover:bg-[#E8D5B5] dark:bg-[#2A2420] dark:hover:bg-[#342D28] text-[#201B18] dark:text-[#FFF9EF] border border-[#E8D5B5] dark:border-[#3D352F] shadow-xs focus-visible:ring-[#D4AF65]',
    ghost:
      'bg-transparent hover:bg-[#F5EBDD]/70 dark:hover:bg-[#2A2420] text-[#6B5E55] dark:text-[#D4AF65] hover:text-[#201B18] dark:hover:text-[#FFF9EF] focus-visible:ring-[#D4AF65]',
    danger:
      'bg-[#C64B32] hover:bg-[#A93C25] text-white shadow-sm shadow-[#C64B32]/30 border border-[#C64B32]/50 focus-visible:ring-[#C64B32]',
    outline:
      'bg-transparent border border-[#D4AF65]/70 dark:border-[#D4AF65]/40 hover:bg-[#F5EBDD]/60 dark:hover:bg-[#2A2420] text-[#C66A18] dark:text-[#D4AF65] font-medium focus-visible:ring-[#D4AF65]',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
      {!isLoading && iconRight && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
};
