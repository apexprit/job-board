import { z } from 'zod';

// Job moderation schema
export const moderateJobSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'PENDING', 'SUSPENDED']),
  rejectionReason: z.string().max(500).optional().nullable(),
  adminNotes: z.string().max(1000).optional().nullable(),
});

// Company moderation schema
export const moderateCompanySchema = z.object({
  status: z.enum(['VERIFIED', 'REJECTED', 'PENDING', 'SUSPENDED']),
  rejectionReason: z.string().max(500).optional().nullable(),
  adminNotes: z.string().max(1000).optional().nullable(),
});

// User moderation schema
// Note: isActive/isVerified fields don't exist in current Prisma schema
// Using suspensionReason and adminNotes for future schema migration
export const moderateUserSchema = z.object({
  suspensionReason: z.string().max(500).optional().nullable(),
  adminNotes: z.string().max(1000).optional().nullable(),
});

// Application moderation schema
export const moderateApplicationSchema = z.object({
  status: z.enum(['PENDING', 'REVIEWED', 'SHORTLISTED', 'REJECTED', 'HIRED']),
  adminNotes: z.string().max(1000).optional().nullable(),
});

// Report handling schema
export const handleReportSchema = z.object({
  action: z.enum(['DISMISS', 'WARN', 'SUSPEND', 'DELETE']),
  adminNotes: z.string().max(1000).optional().nullable(),
  notifyReporter: z.boolean().default(false),
});

// Content flag schema
export const flagContentSchema = z.object({
  contentType: z.enum(['JOB', 'COMPANY', 'USER', 'APPLICATION', 'REVIEW']),
  contentId: z.string(),
  reason: z.enum([
    'SPAM',
    'INAPPROPRIATE',
    'MISLEADING',
    'FAKE',
    'HARASSMENT',
    'OTHER'
  ]),
  details: z.string().max(1000).optional().nullable(),
});

// Pagination and filter schema for moderation lists
export const moderationListSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
  type: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

// Types
export type ModerateJobInput = z.infer<typeof moderateJobSchema>;
export type ModerateCompanyInput = z.infer<typeof moderateCompanySchema>;
export type ModerateUserInput = z.infer<typeof moderateUserSchema>;
export type ModerateApplicationInput = z.infer<typeof moderateApplicationSchema>;
export type HandleReportInput = z.infer<typeof handleReportSchema>;
export type FlagContentInput = z.infer<typeof flagContentSchema>;
export type ModerationListInput = z.infer<typeof moderationListSchema>;