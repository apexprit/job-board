import React from 'react';
import { cn } from '../../utils/cn';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'primary' | 'secondary' | 'white' | 'gray';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  label?: string;
  labelPosition?: 'right' | 'left' | 'top' | 'bottom';
}

const sizeClasses: Record<SpinnerSize, string> = {
  xs: 'h-4 w-4 border-2',
  sm: 'h-6 w-6 border-2',
  md: 'h-8 w-8 border-3',
  lg: 'h-12 w-12 border-4',
  xl: 'h-16 w-16 border-4',
};

const variantClasses: Record<SpinnerVariant, string> = {
  primary: 'border-primary-200 border-t-primary-600',
  secondary: 'border-secondary-200 border-t-secondary-600',
  white: 'border-white/30 border-t-white',
  gray: 'border-gray-200 border-t-gray-600',
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  label,
  labelPosition = 'right',
  className,
  ...props
}) => {
  const spinner = (
    <div
      className={cn(
        'animate-spin rounded-full',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );

  if (!label) {
    return spinner;
  }

  const labelElement = (
    <span
      className={cn(
        'text-sm font-medium',
        variant === 'white' ? 'text-white' : 'text-gray-700'
      )}
    >
      {label}
    </span>
  );

  const containerClasses = cn(
    'inline-flex items-center',
    labelPosition === 'right' && 'space-x-3',
    labelPosition === 'left' && 'space-x-3 flex-row-reverse',
    labelPosition === 'top' && 'flex-col space-y-3',
    labelPosition === 'bottom' && 'flex-col-reverse space-y-3'
  );

  return (
    <div className={containerClasses}>
      {spinner}
      {labelElement}
    </div>
  );
};

// Loading overlay component
export const LoadingOverlay: React.FC<{
  isLoading: boolean;
  text?: string;
  backdrop?: boolean;
  children?: React.ReactNode;
}> = ({ isLoading, text = 'Loading...', backdrop = true, children }) => {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {children && (
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
      )}
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center',
          backdrop && 'bg-white/70'
        )}
      >
        <div className="text-center">
          <Spinner size="lg" />
          {text && (
            <p className="mt-3 text-sm text-gray-600">
              {text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Page loader component
export const PageLoader: React.FC<{
  text?: string;
  fullScreen?: boolean;
}> = ({ text = 'Loading...', fullScreen = true }) => {
  const containerClasses = cn(
    'flex items-center justify-center',
    fullScreen ? 'min-h-screen' : 'min-h-[200px]'
  );

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <Spinner size="xl" />
        {text && (
          <p className="mt-4 text-lg font-medium text-gray-700">
            {text}
          </p>
        )}
      </div>
    </div>
  );
};