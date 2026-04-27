import { z } from 'zod';

// Common validation messages
export const validationMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  minLength: (min: number) => `Must be at least ${min} characters`,
  maxLength: (max: number) => `Must be at most ${max} characters`,
  password: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
  url: 'Please enter a valid URL',
  phone: 'Please enter a valid phone number',
};

// Base schemas
export const emailSchema = z
  .string()
  .min(1, validationMessages.required)
  .email(validationMessages.email);

export const passwordSchema = z
  .string()
  .min(1, validationMessages.required)
  .min(8, validationMessages.minLength(8))
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, validationMessages.password);

export const nameSchema = z
  .string()
  .min(1, validationMessages.required)
  .min(2, validationMessages.minLength(2))
  .max(100, validationMessages.maxLength(100));

export const urlSchema = z
  .string()
  .url(validationMessages.url)
  .optional()
  .or(z.literal(''));

export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-()]+$/, validationMessages.phone)
  .optional()
  .or(z.literal(''));

// Auth schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, validationMessages.required),
});

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(['candidate', 'employer']),
  companyName: z.string().optional(),
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, validationMessages.required),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, validationMessages.required),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Job schemas
export const jobSchema = z.object({
  title: z.string().min(1, validationMessages.required).min(3, validationMessages.minLength(3)),
  description: z.string().min(1, validationMessages.required).min(50, 'Description must be at least 50 characters'),
  location: z.string().min(1, validationMessages.required),
  salaryMin: z.number().min(0, 'Salary must be positive').optional(),
  salaryMax: z.number().min(0, 'Salary must be positive').optional(),
  salaryCurrency: z.string().default('USD'),
  type: z.enum(['full-time', 'part-time', 'contract', 'internship', 'remote']),
  remote: z.boolean().default(false),
  expiresAt: z.date().optional(),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
}).refine((data) => {
  if (data.salaryMin && data.salaryMax) {
    return data.salaryMax >= data.salaryMin;
  }
  return true;
}, {
  message: 'Maximum salary must be greater than or equal to minimum salary',
  path: ['salaryMax'],
});

// Application schemas
export const applicationSchema = z.object({
  coverLetter: z.string().min(1, validationMessages.required).min(100, 'Cover letter must be at least 100 characters'),
  resumeUrl: z.string().url(validationMessages.url).optional(),
});

// Company schemas
export const companySchema = z.object({
  name: z.string().min(1, validationMessages.required).min(2, validationMessages.minLength(2)),
  description: z.string().min(1, validationMessages.required).min(50, 'Description must be at least 50 characters'),
  logoUrl: urlSchema,
  website: urlSchema,
  location: z.string().min(1, validationMessages.required),
});

// Profile schemas
export const profileSchema = z.object({
  name: nameSchema,
  bio: z.string().max(500, validationMessages.maxLength(500)).optional(),
  skills: z.array(z.string()).optional(),
  experience: z.string().optional(),
  education: z.string().optional(),
  location: z.string().optional(),
  phone: phoneSchema,
  website: urlSchema,
  linkedin: urlSchema,
  github: urlSchema,
});

// Search schemas
export const jobSearchSchema = z.object({
  search: z.string().optional(),
  location: z.string().optional(),
  type: z.enum(['full-time', 'part-time', 'contract', 'internship', 'remote']).optional(),
  remote: z.boolean().optional(),
  minSalary: z.number().min(0).optional(),
  maxSalary: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

// Export types
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type JobFormData = z.infer<typeof jobSchema>;
export type ApplicationFormData = z.infer<typeof applicationSchema>;
export type CompanyFormData = z.infer<typeof companySchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type JobSearchFormData = z.infer<typeof jobSearchSchema>;