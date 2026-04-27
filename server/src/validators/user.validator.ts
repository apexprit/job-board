import { z } from 'zod';
import { UserRole } from '@prisma/client';

// User profile update schema
export const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100).optional(),
  lastName: z.string().min(1, 'Last name is required').max(100).optional(),
  phone: z.string().max(20).optional().nullable(),
  bio: z.string().max(1000).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  website: z.string().url().optional().nullable(),
  github: z.string().max(100).optional().nullable(),
  linkedin: z.string().max(100).optional().nullable(),
  twitter: z.string().max(100).optional().nullable(),
  skills: z.array(z.string()).max(20).optional(),
  experience: z.string().max(2000).optional().nullable(),
  education: z.string().max(2000).optional().nullable(),
});

// User role update schema (admin only)
export const updateRoleSchema = z.object({
  role: z.nativeEnum(UserRole),
});

// User status update schema (admin only)
// Note: isActive/isVerified fields don't exist in current Prisma schema
// Schema accepts empty object for future migration
export const updateStatusSchema = z.object({
  isActive: z.boolean().optional(),
  isVerified: z.boolean().optional(),
});

// User password change schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// User avatar upload schema
export const avatarUploadSchema = z.object({
  avatar: z.string().optional(), // This would be the filename
});

// User resume upload schema
export const resumeUploadSchema = z.object({
  resume: z.string().optional(), // This would be the filename
});

// Types
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type AvatarUploadInput = z.infer<typeof avatarUploadSchema>;
export type ResumeUploadInput = z.infer<typeof resumeUploadSchema>;