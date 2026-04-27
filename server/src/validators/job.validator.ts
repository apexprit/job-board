import { z } from 'zod';
import { JobType } from '@prisma/client';

export const createJobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.string().min(1, 'Location is required'),
  type: z.nativeEnum(JobType, {
    errorMap: () => ({ message: 'Invalid job type' }),
  }),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  requirements: z.string().optional(),
  companyId: z.string().min(1, 'Company ID is required'),
});

export const updateJobSchema = createJobSchema.partial();

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;