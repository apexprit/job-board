import { Router } from 'express';
import { CompanyService } from '../services/company.service';
import { CompanyRepository, JobRepository } from '../repositories';
import { createCompanySchema, updateCompanySchema } from '../validators/company.validator';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/rbac.middleware';
import { prisma } from '../config/database';

const router = Router();

// Initialize services
const companyRepository = new CompanyRepository(prisma);
const jobRepository = new JobRepository(prisma);
const companyService = new CompanyService(companyRepository, jobRepository);

/**
 * POST /api/companies
 * Create a new company (employer or admin only)
 */
router.post('/', authenticate, async (req, res) => {
  try {
    // Check if user is employer or admin
    if (req.user!.role !== 'EMPLOYER' && req.user!.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        error: 'Only employers or admins can create companies',
      });
      return;
    }

    const validatedData = createCompanySchema.parse(req.body);
    const company = await companyService.createCompany(validatedData);

    res.status(201).json({
      success: true,
      data: company,
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

    if (error.message === 'Company with this name already exists') {
      res.status(409).json({
        success: false,
        error: error.message,
      });
      return;
    }

    console.error('Create company error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/companies
 * List companies (public)
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = '1',
      limit = '20',
      search,
    } = req.query;

    const result = await companyService.listCompanies({
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      search: search as string,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('List companies error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/companies/:id
 * Get company details (public)
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const company = await companyService.getCompanyById(id as string);

    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error: any) {
    if (error.message === 'Company not found') {
      res.status(404).json({
        success: false,
        error: error.message,
      });
      return;
    }

    console.error('Get company error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * PUT /api/companies/:id
 * Update company (admin only)
 */
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateCompanySchema.parse(req.body);

    const updatedCompany = await companyService.updateCompany(id as string, validatedData);

    res.status(200).json({
      success: true,
      data: updatedCompany,
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

    if (error.message === 'Company not found' || error.message === 'Company with this name already exists') {
      res.status(404).json({
        success: false,
        error: error.message,
      });
      return;
    }

    console.error('Update company error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * DELETE /api/companies/:id
 * Delete company (admin only)
 */
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await companyService.deleteCompany(id as string);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error.message === 'Company not found' || error.message === 'Cannot delete company with existing jobs') {
      res.status(404).json({
        success: false,
        error: error.message,
      });
      return;
    }

    console.error('Delete company error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/companies/:id/jobs
 * List company's approved jobs (public)
 */
router.get('/:id/jobs', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      page = '1',
      limit = '20',
      status,
    } = req.query;

    const result = await companyService.getCompanyJobs(id as string, {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      status: status as any,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error.message === 'Company not found') {
      res.status(404).json({
        success: false,
        error: error.message,
      });
      return;
    }

    console.error('Get company jobs error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;