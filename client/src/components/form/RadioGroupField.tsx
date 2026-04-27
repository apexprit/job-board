import {
  useFormContext,
  RegisterOptions,
  FieldError,
  Path,
  FieldValues,
} from 'react-hook-form';

interface RadioOption {
  value: string | number;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface RadioGroupFieldProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  options?: RegisterOptions<T, Path<T>>;
  className?: string;
  radioOptions: RadioOption[];
  orientation?: 'horizontal' | 'vertical';
}

export function RadioGroupField<T extends FieldValues>({
  name,
  label,
  description,
  required = false,
  disabled = false,
  options,
  className = '',
  radioOptions,
  orientation = 'vertical',
}: RadioGroupFieldProps<T>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();

  const error = errors[name] as FieldError | undefined;
  const fieldId = `radio-${name.toString()}`;

  return (
    <div className={`space-y-3 ${className}`}>
      {(label || description) && (
        <div>
          {label && (
            <label className="block text-sm font-medium text-gray-700">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          {description && !error && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
      )}

      <div
        className={`space-y-2 ${orientation === 'horizontal' ? 'flex flex-wrap gap-4' : ''}`}
      >
        {radioOptions.map((option) => {
          const optionId = `${fieldId}-${option.value}`;
          return (
            <div
              key={option.value}
              className={`flex items-start ${orientation === 'horizontal' ? '' : 'space-x-3'}`}
            >
              <div className="flex items-center h-5">
                <input
                  id={optionId}
                  type="radio"
                  value={option.value}
                  {...register(name, {
                    required: required ? `${label || name} is required` : false,
                    ...options,
                  })}
                  disabled={disabled || option.disabled}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
              </div>
              <div className="text-sm">
                <label
                  htmlFor={optionId}
                  className={`font-medium ${disabled || option.disabled ? 'text-gray-400' : 'text-gray-700'}`}
                >
                  {option.label}
                </label>
                {option.description && (
                  <p className="text-gray-500">{option.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {error && <p className="text-sm text-red-600">{error.message}</p>}
    </div>
  );
}