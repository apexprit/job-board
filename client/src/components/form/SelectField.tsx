import {
  useFormContext,
  RegisterOptions,
  FieldError,
  Path,
  FieldValues,
} from 'react-hook-form';
import { LucideIcon } from 'lucide-react';

interface Option {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectFieldProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  options?: RegisterOptions<T, Path<T>>;
  className?: string;
  optionsList: Option[];
  multiple?: boolean;
}

export function SelectField<T extends FieldValues>({
  name,
  label,
  placeholder = 'Select an option',
  description,
  required = false,
  disabled = false,
  icon: Icon,
  options,
  className = '',
  optionsList,
  multiple = false,
}: SelectFieldProps<T>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();

  const error = errors[name] as FieldError | undefined;
  const fieldId = `select-${name.toString()}`;

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
        <select
          id={fieldId}
          {...register(name, {
            required: required ? `${label || name} is required` : false,
            ...options,
          })}
          disabled={disabled}
          multiple={multiple}
          className={`
            w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            ${Icon ? 'pl-10' : ''}
            ${multiple ? 'min-h-[100px]' : ''}
            appearance-none
          `}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {optionsList.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        {!Icon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        )}
      </div>

      {description && !error && (
        <p className="text-sm text-gray-500">{description}</p>
      )}

      {error && <p className="text-sm text-red-600">{error.message}</p>}
    </div>
  );
}