/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  padding = 'md',
  border = true,
  onClick,
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverStyles = hover
    ? 'hover:border-[#D4AF65] dark:hover:border-[#D4AF65]/60 hover:shadow-md hover:shadow-[#D4AF65]/10 transition-all duration-300'
    : '';

  const borderStyles = border
    ? 'border border-[#E8D5B5] dark:border-[#3D352F]'
    : '';

  return (
    <div
      onClick={onClick}
      className={`bg-[#FFF9EF] dark:bg-[#201B18] rounded-2xl ${borderStyles} ${paddingStyles[padding]} ${hoverStyles} ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
