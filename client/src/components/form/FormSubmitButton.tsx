import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Loader2 } from 'lucide-react';

interface FormSubmitButtonProps {
  label: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export function FormSubmitButton({
  label,
  loading = false,
  disabled = false,
  className = '',
  icon,
  fullWidth = false,
}: FormSubmitButtonProps) {
  const { formState } = useFormContext();
  const isSubmitting = formState.isSubmitting || loading;
  const isDisabled = disabled || isSubmitting || formState.isValidating;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center px-4 py-2 border border-transparent 
        text-sm font-medium rounded-lg shadow-sm text-white bg-primary-600 
        hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {label}
        </>
      )}
    </button>
  );
}