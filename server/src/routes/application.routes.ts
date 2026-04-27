import { Router } from 'express';
import { ApplicationService } from '../services/application.service';
import { ApplicationRepository, JobRepository } from '../repositories';
import { createApplicationSchema, updateApplicationStatusSchema } from '../validators/application.validator';
import { authenticate } from '../middleware/auth.middleware';
import { requireSeeker, requireEmployer } from '../middleware/rbac.middleware';
import { prisma } from '../config/database';

const router = Router();

// Initialize services
const applicationRepository = new ApplicationRepository(prisma);
const jobRepository = new JobRepository(prisma);
const applicationService = new ApplicationService(applicationRepository, jobRepository);

/**
 * POST /api/applications
 * Apply for a job (seeker only)
 */
router.post('/', authenticate, requireSeeker, async (req, res) => {
  try {
    const validatedData = createApplicationSchema.parse(req.body);

    const application = await applicationService.applyForJob(
      req.user!.userId,
      validatedData.jobId,
      validatedData
    );

    res.status(201).json({
      success: true,
      data: application,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors,
      });
      return;
    }

    if (error.message === 'You have already applied for this job') {
      res.status(409).json({
        success: false,
        error: error.message,
      });
      return;
    }

    if (
      error.message === 'Job not found' ||
      error.message === 'Job is not available for applications'
    ) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
      return;
    }

    console.error('Apply for job error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/applications/seeker
 * List seeker's own applications
 */
router.get('/seeker', authenticate, requireSeeker, async (req, res) => {
  try {
    const {
      page = '1',
      limit = '20',
      status,
    } = req.query;

    const result = await applicationService.listApplicationsBySeeker(req.user!.userId, {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      status: status as any,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('List seeker applications error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/applications/job/:jobId
 * List applications for a job (employer or admin)
 */
router.get('/job/:jobId', authenticate, async (req, res) => {
  try {
    const { jobId } = req.params;
    const {
      page = '1',
      limit = '20',
      status,
    } = req.query;

    // Check if user is admin or employer of the job
    const job = await jobRepository.findById(jobId as string);
    if (!job) {
      res.status(404).json({
        success: false,
        error: 'Job not found',
      });
      return;
    }

    const isAdmin = req.user!.role === 'ADMIN';
    const isEmployer = job.employerId === req.user!.userId;

    if (!isAdmin && !isEmployer) {
      res.status(403).json({
        success: false,
        error: 'Unauthorized to view applications for this job',
      });
      return;
    }

    const result = await applicationService.listApplicationsByJob(
      jobId as string,
      req.user!.userId,
      {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        status: status as any,
      }
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error.message === 'Job not found' || error.message.includes('Unauthorized')) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
      return;
    }

    console.error('List job applications error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/applications/:id
 * Get application by ID (seeker, employer of job, or admin)
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const application = await applicationService.getApplicationById(id as string);

    // Authorization check
    const isAdmin = req.user!.role === 'ADMIN';
    const isSeeker = application.seekerId === req.user!.userId;
    const isEmployer = application.job.employerId === req.user!.userId;

    if (!isAdmin && !isSeeker && !isEmployer) {
      res.status(403).json({
        success: false,
        error: 'Unauthorized to view this application',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error: any) {
    if (error.message === 'Application not found') {
      res.status(404).json({
        success: false,
        error: error.message,
      });
      return;
    }

    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * PATCH /api/applications/:id/status
 * Update application status (employer only)
 */
router.patch('/:id/status', authenticate, requireEmployer, async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateApplicationStatusSchema.parse(req.body);

    const updatedApplication = await applicationService.updateApplicationStatus(
      id as string,
      req.user!.userId,
      validatedData
    );

    res.status(200).json({
      success: true,
      data: updatedApplication,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors,
      });
      return;
    }

    if (error.message === 'Application not found' || error.message.includes('Unauthorized')) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
      return;
    }

    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * DELETE /api/applications/:id
 * Withdraw application (seeker only)
 */
router.delete('/:id', authenticate, requireSeeker, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await applicationService.withdrawApplication(id as string, req.user!.userId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error.message === 'Application not found' || error.message.includes('Unauthorized')) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
      return;
    }

    console.error('Withdraw application error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
