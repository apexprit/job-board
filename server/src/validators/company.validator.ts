import { z } from 'zod';

export const createCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  description: z.string().optional(),
  logoUrl: z.string().url('Invalid URL format').optional(),
  websiteUrl: z.string().url('Invalid URL format').optional(),
  industry: z.string().optional(),
  location: z.string().optional(),
});

export const updateCompanySchema = createCompanySchema.partial();

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;