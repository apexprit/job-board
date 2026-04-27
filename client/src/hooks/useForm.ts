import { useForm as useReactHookForm, UseFormReturn, DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z, ZodSchema } from 'zod';
import { useState } from 'react';

interface UseFormOptions<T extends z.ZodSchema> {
  schema: T;
  defaultValues?: DefaultValues<z.infer<T>>;
  onSubmit?: (data: z.infer<T>) => Promise<void> | void;
  onError?: (errors: any) => void;
}

export function useForm<T extends ZodSchema>({
  schema,
  defaultValues,
  onSubmit,
  onError,
}: UseFormOptions<T>) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useReactHookForm<z.infer<T>>({
    resolver: zodResolver(schema as any),
    defaultValues: defaultValues as any,
    mode: 'onTouched' as any,
    reValidateMode: 'onChange' as any,
  });

  const handleSubmit = async (e?: React.BaseSyntheticEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!onSubmit) return;

    const isValid = await form.trigger();
    if (!isValid) {
      onError?.(form.formState.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(form.getValues());
    } catch (error) {
      console.error('Form submission error:', error);
      onError?.(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    form.reset();
  };

  return {
    ...form,
    handleSubmit: () => handleSubmit(),
    isSubmitting,
    resetForm,
  } as UseFormReturn<z.infer<T>> & {
    handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
    isSubmitting: boolean;
    resetForm: () => void;
  };
}