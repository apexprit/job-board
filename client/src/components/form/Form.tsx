import React from 'react';
import {
  FormProvider,
  UseFormReturn,
  FieldValues,
} from 'react-hook-form';

interface FormProps<T extends FieldValues> {
  form: UseFormReturn<T> & {
    handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
    isSubmitting: boolean;
    resetForm: () => void;
  };
  onSubmit?: (data: any) => Promise<void> | void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function Form<T extends FieldValues>({
  form,
  onSubmit: _onSubmit,
  children,
  className = '',
  disabled: _disabled = false,
}: FormProps<T>) {
  // Use the custom handleSubmit from our useForm hook
  // which already handles validation and calls onSubmit
  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    form.handleSubmit();
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={onFormSubmit}
        className={`space-y-6 ${className}`}
        noValidate
      >
        {children}
      </form>
    </FormProvider>
  );
}
