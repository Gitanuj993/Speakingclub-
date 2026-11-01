/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode } from 'react';
import { Button } from './Button';
import { AlertCircle, FolderOpen } from 'lucide-react';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-[#D4AF65]/40 rounded-2xl bg-[#F5EBDD]/40 dark:bg-[#201B18]/60 ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-[#FFF0DF] dark:bg-[#C66A18]/20 text-[#C66A18] dark:text-[#E68A24] border border-[#E68A24]/20 flex items-center justify-center mb-4 shadow-xs">
        {icon || <FolderOpen className="w-6 h-6" />}
      </div>
      <h3 className="text-base font-bold text-[#201B18] dark:text-[#FFF9EF] font-serif">
        {title}
      </h3>
      <p className="text-xs text-[#6B5E55] dark:text-[#E8D5B5] mt-1.5 max-w-sm leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" className="mt-5">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export interface ErrorStateProps {
  title: string;
  message: string;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  retryLabel = 'Try Again',
  onRetry,
  className = '',
}) => {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center text-center p-6 sm:p-8 border border-[#C64B32]/30 rounded-2xl bg-[#FBECE9]/70 dark:bg-[#C64B32]/10 ${className}`}
    >
      <div className="w-10 h-10 rounded-xl bg-[#FBECE9] dark:bg-[#C64B32]/30 text-[#C64B32] flex items-center justify-center mb-3">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-semibold text-[#C64B32] dark:text-[#E88C78]">
        {title}
      </h3>
      <p className="text-xs text-[#6B5E55] dark:text-[#E8D5B5] mt-1 max-w-sm">
        {message}
      </p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="mt-4 border-[#C64B32]/50 text-[#C64B32] hover:bg-[#FBECE9]"
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );
};

export interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = 'h-4 w-full' }) => {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-[#E8D5B5]/60 dark:bg-[#342D28] rounded-lg ${className}`}
    />
  );
};
