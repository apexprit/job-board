import React from 'react';
import { cn } from '../../utils/cn';

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  rounded?: boolean;
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-800',
  primary: 'bg-primary-100 text-primary-800',
  secondary: 'bg-secondary-100 text-secondary-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  outline: 'bg-transparent border border-gray-300 text-gray-700',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      rounded = false,
      dot = false,
      removable = false,
      onRemove,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-medium',
          variantClasses[variant],
          sizeClasses[size],
          rounded ? 'rounded-full' : 'rounded',
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              'mr-1.5 h-1.5 w-1.5 rounded-full',
              variant === 'default' && 'bg-gray-500',
              variant === 'primary' && 'bg-primary-500',
              variant === 'secondary' && 'bg-secondary-500',
              variant === 'success' && 'bg-green-500',
              variant === 'warning' && 'bg-yellow-500',
              variant === 'danger' && 'bg-red-500',
              variant === 'info' && 'bg-blue-500',
              variant === 'outline' && 'bg-gray-500'
            )}
          />
        )}

        {children}

        {removable && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.();
            }}
            className="ml-1.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-current hover:bg-current/10 focus:outline-none"
          >
            <span className="sr-only">Remove</span>
            <svg
              className="h-2 w-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

// Status badge component
export const StatusBadge: React.FC<{
  status: 'active' | 'inactive' | 'pending' | 'approved' | 'rejected' | 'success' | 'error';
  label?: string;
  size?: BadgeSize;
}> = ({ status, label, size = 'md' }) => {
  const statusConfig = {
    active: { variant: 'success' as BadgeVariant, defaultLabel: 'Active' },
    inactive: { variant: 'default' as BadgeVariant, defaultLabel: 'Inactive' },
    pending: { variant: 'warning' as BadgeVariant, defaultLabel: 'Pending' },
    approved: { variant: 'success' as BadgeVariant, defaultLabel: 'Approved' },
    rejected: { variant: 'danger' as BadgeVariant, defaultLabel: 'Rejected' },
    success: { variant: 'success' as BadgeVariant, defaultLabel: 'Success' },
    error: { variant: 'danger' as BadgeVariant, defaultLabel: 'Error' },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} size={size} dot>
      {label || config.defaultLabel}
    </Badge>
  );
};