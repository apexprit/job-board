import { z } from 'zod';
import { ApplicationStatus } from '@prisma/client';

export const createApplicationSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  coverLetter: z.string().optional(),
  resumeUrl: z.string().url('Invalid URL format').optional(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.nativeEnum(ApplicationStatus, {
    errorMap: () => ({ message: 'Invalid application status' }),
  }),
  reason: z.string().optional(),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;