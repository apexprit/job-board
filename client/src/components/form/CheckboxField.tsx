import {
  useFormContext,
  RegisterOptions,
  FieldError,
  Path,
  FieldValues,
} from 'react-hook-form';

interface CheckboxFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  options?: RegisterOptions<T, Path<T>>;
  className?: string;
}

export function CheckboxField<T extends FieldValues>({
  name,
  label,
  description,
  required = false,
  disabled = false,
  options,
  className = '',
}: CheckboxFieldProps<T>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();

  const error = errors[name] as FieldError | undefined;
  const fieldId = `checkbox-${name.toString()}`;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id={fieldId}
            type="checkbox"
            {...register(name, {
              required: required ? `${label} is required` : false,
              ...options,
            })}
            disabled={disabled}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
        </div>
        <div className="ml-3 text-sm">
          <label
            htmlFor={fieldId}
            className={`font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'}`}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {description && (
            <p className="text-gray-500">{description}</p>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error.message}</p>}
    </div>
  );
}