/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode } from 'react';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'gold'
  | 'maroon'
  | 'outline';

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  icon?: ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  icon,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5 gap-1',
    md: 'text-xs px-3 py-1 gap-1.5',
  };

  const variantStyles = {
    default:
      'bg-[#F5EBDD] text-[#6B5E55] dark:bg-[#2A2420] dark:text-[#E8D5B5] border border-[#E8D5B5] dark:border-[#3D352F]',
    primary:
      'bg-[#FFF0DF] text-[#C66A18] dark:bg-[#C66A18]/20 dark:text-[#E68A24] border border-[#E68A24]/30',
    gold:
      'bg-[#FBF6EC] text-[#B08930] dark:bg-[#D4AF65]/15 dark:text-[#D4AF65] border border-[#D4AF65]/40',
    success:
      'bg-[#F4F5E6] text-[#616035] dark:bg-[#77764B]/20 dark:text-[#D4AF65] border border-[#77764B]/30',
    warning:
      'bg-[#FFF5E6] text-[#C66A18] dark:bg-[#E68A24]/15 dark:text-[#E68A24] border border-[#E68A24]/30',
    danger:
      'bg-[#FBECE9] text-[#C64B32] dark:bg-[#C64B32]/20 dark:text-[#E88C78] border border-[#C64B32]/30',
    maroon:
      'bg-[#F7EBEF] text-[#722F37] dark:bg-[#722F37]/20 dark:text-[#E8A5AE] border border-[#722F37]/30',
    outline:
      'bg-transparent text-[#C66A18] dark:text-[#D4AF65] border border-[#D4AF65]/60 dark:border-[#D4AF65]/35',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
