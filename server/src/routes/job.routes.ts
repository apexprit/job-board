import { Router } from 'express';
import { JobService } from '../services/job.service';
import { JobRepository } from '../repositories';
import { CacheService } from '../utils/cache';
import { createJobSchema, updateJobSchema } from '../validators/job.validator';
import { authenticate } from '../middleware/auth.middleware';
import { requireEmployer } from '../middleware/rbac.middleware';
import { prisma } from '../config/database';

const router = Router();

// Initialize services
const jobRepository = new JobRepository(prisma);
const cacheService = new CacheService();
const jobService = new JobService(jobRepository, cacheService);

/**
 * POST /api/jobs
 * Create a new job (employer only)
 */
router.post('/', authenticate, requireEmployer, async (req, res) => {
  try {
    // Validate request body
    const validatedData = createJobSchema.parse(req.body);

    // Create job
    const job = await jobService.createJob(req.user!.userId, validatedData);

    res.status(201).json({
      success: true,
      data: job,
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

    if (error.message.includes('Unauthorized') || error.message.includes('not found')) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
      return;
    }

    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Transform frontend enum values to server enum values for query params
const JOB_TYPE_SERVER_MAP: Record<string, string> = {
  'full-time': 'FULL_TIME',
  'part-time': 'PART_TIME',
  'contract': 'CONTRACT',
  'internship': 'INTERNSHIP',
  'remote': 'REMOTE',
  'FULL_TIME': 'FULL_TIME',
  'PART_TIME': 'PART_TIME',
  'CONTRACT': 'CONTRACT',
  'INTERNSHIP': 'INTERNSHIP',
  'REMOTE': 'REMOTE',
};

/**
 * GET /api/jobs
 * List jobs with filters (public)
 * Accepts both 'search' and 'keyword' as search parameter
 */
router.get('/', async (req, res) => {
  try {
    const {
      search,
      keyword,
      location,
      type,
      salaryMin,
      salaryMax,
      minSalary,
      maxSalary,
      page = '1',
      limit = '20',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Accept both 'search' and 'keyword' as the search term
    const searchTerm = (search || keyword) as string | undefined;
    // Accept both salaryMin/salaryMax and minSalary/maxSalary
    const salaryMinVal = salaryMin || minSalary;
    const salaryMaxVal = salaryMax || maxSalary;

    // Transform type from frontend format (full-time) to server format (FULL_TIME)
    const typeValue = type ? (JOB_TYPE_SERVER_MAP[type as string] || type) as string : undefined;

    const searchParams: any = {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      sortBy: sortBy as 'createdAt' | 'salary',
      sortOrder: sortOrder as 'asc' | 'desc',
    };

    if (searchTerm) searchParams.keyword = searchTerm;
    if (location) searchParams.location = location as string;
    if (typeValue) searchParams.type = typeValue;
    if (salaryMinVal) searchParams.salaryMin = parseInt(salaryMinVal as string, 10);
    if (salaryMaxVal) searchParams.salaryMax = parseInt(salaryMaxVal as string, 10);

    const result = await jobService.searchJobs(searchParams);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('List jobs error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/jobs/search
 * Search jobs with filters (public)
 * NOTE: Must be defined before /:id to avoid route conflict
 */
router.get('/search', async (req, res) => {
  try {
    const {
      keyword,
      search,
      location,
      type,
      salaryMin,
      salaryMax,
      page = '1',
      limit = '20',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Accept both 'search' and 'keyword'
    const searchTerm = (search || keyword) as string | undefined;

    // Transform type from frontend format to server format
    const typeValue = type ? (JOB_TYPE_SERVER_MAP[type as string] || type) as string : undefined;

    const searchParams: any = {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      sortBy: sortBy as 'createdAt' | 'salary',
      sortOrder: sortOrder as 'asc' | 'desc',
    };

    if (searchTerm) searchParams.keyword = searchTerm;
    if (location) searchParams.location = location as string;
    if (typeValue) searchParams.type = typeValue;
    if (salaryMin) searchParams.salaryMin = parseInt(salaryMin as string, 10);
    if (salaryMax) searchParams.salaryMax = parseInt(salaryMax as string, 10);

    const result = await jobService.searchJobs(searchParams);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Search jobs error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/jobs/my
 * Get jobs posted by the authenticated employer
 */
router.get('/my', authenticate, requireEmployer, async (req, res) => {
  try {
    const {
      page = '1',
      limit = '20',
    } = req.query;

    const result = await jobService.listJobs({
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      employerId: req.user!.userId,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Get my jobs error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/jobs/featured
 * Get featured jobs (public)
 */
router.get('/featured', async (_req, res) => {
  try {
    const result: any = await jobService.searchJobs({ limit: 6, sortBy: 'createdAt', sortOrder: 'desc' });
    res.status(200).json({
      success: true,
      data: result.data || [],
    });
  } catch (error: any) {
    console.error('Get featured jobs error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/jobs/stats
 * Get job statistics (public)
 */
router.get('/stats', async (_req, res) => {
  try {
    const result: any = await jobService.searchJobs({ limit: 1000 });
    const jobs: any[] = result.data || [];
    const byType: Record<string, number> = {};
    const byLocation: Record<string, number> = {};
    jobs.forEach((job: any) => {
      byType[job.type] = (byType[job.type] || 0) + 1;
      byLocation[job.location] = (byLocation[job.location] || 0) + 1;
    });
    res.status(200).json({
      success: true,
      data: { total: result.total || jobs.length, byType, byLocation },
    });
  } catch (error: any) {
    console.error('Get job stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/jobs/:id/similar
 * Get similar jobs (public)
 */
router.get('/:id/similar', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = '4' } = req.query;
    // Get the job first, then find similar ones by location/type
    await jobService.getJobById(id as string);
    const result: any = await jobService.searchJobs({ limit: parseInt(limit as string, 10) });
    // Filter out the current job
    const similar = (result.data || []).filter((j: any) => j.id !== id);
    res.status(200).json({
      success: true,
      data: similar,
    });
  } catch (error: any) {
    // If job not found, return empty array
    res.status(200).json({
      success: true,
      data: [],
    });
  }
});

/**
 * GET /api/jobs/:id
 * Get job by ID (public)
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const job = await jobService.getJobById(id as string);

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error: any) {
    if (error.message === 'Job not found') {
      res.status(404).json({
        success: false,
        error: error.message,
      });
      return;
    }

    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * PUT /api/jobs/:id
 * Update job (job owner or admin)
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateJobSchema.parse(req.body);

    // Check if user is admin
    const isAdmin = req.user!.role === 'ADMIN';
    
    // If not admin, check if user is the job owner
    const job = await jobService.getJobById(id as string);
    if (!isAdmin && job.employerId !== req.user!.userId) {
      res.status(403).json({
        success: false,
        error: 'Unauthorized to update this job',
      });
      return;
    }

    const updatedJob = await jobService.updateJob(id as string, req.user!.userId, validatedData);

    res.status(200).json({
      success: true,
      data: updatedJob,
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

    if (error.message === 'Job not found' || error.message.includes('Unauthorized')) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
      return;
    }

    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * DELETE /api/jobs/:id
 * Delete job (job owner or admin)
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is admin
    const isAdmin = req.user!.role === 'ADMIN';
    
    // If not admin, check if user is the job owner
    const job = await jobService.getJobById(id as string);
    if (!isAdmin && job.employerId !== req.user!.userId) {
      res.status(403).json({
        success: false,
        error: 'Unauthorized to delete this job',
      });
      return;
    }

    const result = await jobService.deleteJob(id as string, req.user!.userId);

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

    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;