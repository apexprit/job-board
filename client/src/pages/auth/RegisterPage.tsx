import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock } from 'lucide-react';
import { z } from 'zod';
import { useForm } from '../../hooks/useForm';
import { useAuth } from '../../hooks/useAuth';
import { getDashboardPath } from '../../context/AuthContext';
import { GuestRoute } from '../../components/auth';
import { Form, FormField, FormSubmitButton, RadioGroupField } from '../../components/form';
import { validationMessages } from '../../schemas';

// Custom register schema matching backend expectations
const registerSchema = z.object({
  firstName: z.string().min(1, validationMessages.required).min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(1, validationMessages.required).min(2, 'Last name must be at least 2 characters'),
  email: z.string().min(1, validationMessages.required).email(validationMessages.email),
  password: z.string().min(1, validationMessages.required).min(8, validationMessages.minLength(8))
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, validationMessages.password),
  confirmPassword: z.string().min(1, validationMessages.required),
  role: z.enum(['candidate', 'employer']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register: registerApi } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (data: RegisterFormData) => {
    setError(null);
    try {
      // Combine firstName and lastName into name
      const name = `${data.firstName} ${data.lastName}`;
      await registerApi({
        name,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      const storedUser = JSON.parse(localStorage.getItem('jobboard_user') || '{}');
      navigate(getDashboardPath(storedUser?.role || data.role));
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  const form = useForm({
    schema: registerSchema,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'candidate' as const,
    },
    onSubmit: handleRegister,
  });

  return (
    <GuestRoute>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Create Your Account</h1>
            <p className="mt-2 text-gray-600">Join thousands of job seekers and employers</p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <Form form={form} onSubmit={handleRegister}>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  name="firstName"
                  label="First Name"
                  type="text"
                  placeholder="John"
                  required
                  icon={User}
                />
                <FormField
                  name="lastName"
                  label="Last Name"
                  type="text"
                  placeholder="Doe"
                  required
                  icon={User}
                />
              </div>

              <FormField
                name="email"
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                required
                icon={Mail}
              />

              <FormField
                name="password"
                label="Password"
                type="password"
                placeholder="••••••••"
                required
                icon={Lock}
                options={{
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                }}
              />

              <FormField
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                required
                icon={Lock}
              />

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">I am a</label>
                <RadioGroupField
                  name="role"
                  radioOptions={[
                    { value: 'candidate', label: 'Job Seeker', description: 'Looking for job opportunities' },
                    { value: 'employer', label: 'Employer', description: 'Hiring talent for my company' },
                  ]}
                  orientation="horizontal"
                />
              </div>

              <FormSubmitButton
                label="Create Account"
                loading={form.isSubmitting}
                fullWidth
                className="mt-6"
              />

              <div className="mt-6 text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Login
                </Link>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </GuestRoute>
  );
};

export default RegisterPage;