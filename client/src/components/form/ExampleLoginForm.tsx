import { Mail, Lock } from 'lucide-react';
import { useForm } from '../../hooks/useForm';
import { loginSchema } from '../../schemas';
import { Form, FormField, FormSubmitButton } from './index';

interface ExampleLoginFormProps {
  onSubmit: (data: { email: string; password: string }) => Promise<void>;
  loading?: boolean;
}

export function ExampleLoginForm({ onSubmit, loading = false }: ExampleLoginFormProps) {
  const form = useForm({
    schema: loginSchema,
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit,
  });

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Login to JobBoard</h2>
      
      <Form form={form} onSubmit={onSubmit}>
        <FormField
          name="email"
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          required
          icon={Mail}
          options={{
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          }}
        />

        <FormField
          name="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          required
          icon={Lock}
          options={{
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters',
            },
          }}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <a href="/forgot-password" className="text-primary-600 hover:text-primary-500">
              Forgot your password?
            </a>
          </div>
        </div>

        <FormSubmitButton
          label="Sign In"
          loading={loading || form.isSubmitting}
          fullWidth
          className="mt-4"
        />

        <div className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/register" className="text-primary-600 hover:text-primary-500 font-medium">
            Sign up
          </a>
        </div>
      </Form>
    </div>
  );
}