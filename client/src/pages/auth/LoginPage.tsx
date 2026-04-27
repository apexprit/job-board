import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useForm } from '../../hooks/useForm';
import { loginSchema } from '../../schemas';
import { useAuth } from '../../hooks/useAuth';
import { getDashboardPath } from '../../context/AuthContext';
import { GuestRoute } from '../../components/auth';
import { Form, FormField, FormSubmitButton } from '../../components/form';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (data: { email: string; password: string }) => {
    setError(null);
    try {
      await login(data);
      // Read user from localStorage since React state may not have updated yet
      const storedUser = JSON.parse(localStorage.getItem('jobboard_user') || '{}');
      navigate(getDashboardPath(storedUser?.role || 'candidate'));
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const form = useForm({
    schema: loginSchema,
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: handleLogin,
  });

  return (
    <GuestRoute>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
            <p className="mt-2 text-gray-600">Sign in to your account to continue</p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <Form form={form} onSubmit={handleLogin}>
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
                  <span className="font-medium text-gray-400 cursor-not-allowed" title="Coming soon">
                    Forgot your password?
                  </span>
                </div>
              </div>

              <FormSubmitButton
                label="Sign In"
                loading={form.isSubmitting}
                fullWidth
                className="mt-6"
              />

              <div className="mt-6 text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Register
                </Link>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </GuestRoute>
  );
};

export default LoginPage;