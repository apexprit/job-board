import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/rbac.middleware';
import {
  moderateJobSchema,
  moderateCompanySchema,
  moderateUserSchema,
  moderateApplicationSchema,
  handleReportSchema,
  flagContentSchema,
} from '../validators/moderation.validator';
import { ModerationService } from '../services/moderation.service';
import { JobRepository } from '../repositories/job.repository';
import { CompanyRepository } from '../repositories/company.repository';
import { UserRepository } from '../repositories/user.repository';
import { ApplicationRepository } from '../repositories/application.repository';
import { CacheService } from '../utils/cache';
import { prisma } from '../config/database';

const router = Router();

// Initialize services
const jobRepository = new JobRepository(prisma);
const companyRepository = new CompanyRepository(prisma);
const userRepository = new UserRepository(prisma);
const applicationRepository = new ApplicationRepository(prisma);
const cacheService = new CacheService();
const moderationService = new ModerationService(
  jobRepository,
  companyRepository,
  userRepository,
  applicationRepository,
  cacheService,
  prisma
);

// Get pending jobs for moderation
router.get('/jobs/pending', authenticate, requireAdmin, async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    
    const result = await moderationService.getPendingJobs(page, limit);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get pending companies for moderation
router.get('/companies/pending', authenticate, requireAdmin, async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    
    const result = await moderationService.getPendingCompanies(page, limit);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get pending applications for moderation
router.get('/applications/pending', authenticate, requireAdmin, async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    
    const result = await moderationService.getPendingApplications(page, limit);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Moderate a job
router.put('/jobs/:id/moderate', authenticate, requireAdmin, async (req, res) => {
  try {
    const validatedData = moderateJobSchema.parse(req.body);
    const jobId = req.params.id as string;
    const adminId = req.user!.userId;
    
    const result = await moderationService.moderateJob(jobId, adminId, validatedData);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Moderate a company
router.put('/companies/:id/moderate', authenticate, requireAdmin, async (req, res) => {
  try {
    const validatedData = moderateCompanySchema.parse(req.body);
    const companyId = req.params.id as string;
    const adminId = req.user!.userId;
    
    const result = await moderationService.moderateCompany(companyId, adminId, validatedData);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Moderate a user
router.put('/users/:id/moderate', authenticate, requireAdmin, async (req, res) => {
  try {
    const validatedData = moderateUserSchema.parse(req.body);
    const userId = req.params.id as string;
    const adminId = req.user!.userId;
    
    const result = await moderationService.moderateUser(userId, adminId, validatedData);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Moderate an application
router.put('/applications/:id/moderate', authenticate, requireAdmin, async (req, res) => {
  try {
    const validatedData = moderateApplicationSchema.parse(req.body);
    const applicationId = req.params.id as string;
    const adminId = req.user!.userId;
    
    const result = await moderationService.moderateApplication(applicationId, adminId, validatedData);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get moderation statistics
router.get('/stats', authenticate, requireAdmin, async (_req, res) => {
  try {
    const stats = await moderationService.getModerationStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get moderation logs
router.get('/logs', authenticate, requireAdmin, async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    
    const logs = await moderationService.getModerationLogs(page, limit);
    res.json({ success: true, data: logs });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Flag content (for users to report content)
router.post('/flag', authenticate, async (req, res) => {
  try {
    const validatedData = flagContentSchema.parse(req.body);
    const userId = req.user!.userId;
    
    const result = await moderationService.flagContent(userId, validatedData);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Handle report (admin only)
router.post('/reports/:id/handle', authenticate, requireAdmin, async (req, res) => {
  try {
    const validatedData = handleReportSchema.parse(req.body);
    const reportId = req.params.id as string;
    const adminId = req.user!.userId;
    
    const result = await moderationService.handleReport(reportId, adminId, validatedData);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;