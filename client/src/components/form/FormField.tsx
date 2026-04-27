import React from 'react';
import {
  useFormContext,
  RegisterOptions,
  FieldError,
  Path,
  FieldValues,
} from 'react-hook-form';
import { LucideIcon } from 'lucide-react';

interface FormFieldProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea';
  description?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  options?: RegisterOptions<T, Path<T>>;
  className?: string;
  children?: React.ReactNode;
}

export function FormField<T extends FieldValues>({
  name,
  label,
  placeholder,
  type = 'text',
  description,
  required = false,
  disabled = false,
  icon: Icon,
  options,
  className = '',
  children,
}: FormFieldProps<T>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();

  const error = errors[name] as FieldError | undefined;
  const fieldId = `field-${name.toString()}`;

  const renderInput = () => {
    if (children) {
      return children;
    }

    const commonProps = {
      id: fieldId,
      ...register(name, {
        required: required ? `${label || name} is required` : false,
        ...options,
      }),
      placeholder,
      disabled,
      className: `
        w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
        ${error ? 'border-red-500' : 'border-gray-300'}
        ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
        ${Icon ? 'pl-10' : ''}
        ${type === 'textarea' ? 'min-h-[100px] resize-vertical' : ''}
      `,
    };

    if (type === 'textarea') {
      return <textarea {...commonProps} />;
    }

    return <input type={type} {...commonProps} />;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label
          htmlFor={fieldId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Icon size={18} />
          </div>
        )}
        {renderInput()}
      </div>

      {description && !error && (
        <p className="text-sm text-gray-500">{description}</p>
      )}

      {error && (
        <p className="text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
}