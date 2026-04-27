import request from 'supertest';
import app from '../../index';
import { prisma } from '../../config/database';
import { createTestUser, createTestJob, createTestCompany, cleanDatabase } from '../helpers';
import { UserRole } from '@prisma/client';

describe('Jobs API Integration Tests', () => {
  let seeker: any;
  let employer: any;
  let testJob: any;
  let testCompany: any;

  beforeAll(async () => {
    await cleanDatabase();
    
    // Create test users
    seeker = await createTestUser(UserRole.SEEKER);
    employer = await createTestUser(UserRole.EMPLOYER);
    
    // Create a test company for the employer
    testCompany = await createTestCompany(employer.accessToken);
    
    // Create a test job (helper auto-approves it)
    testJob = await createTestJob(employer.accessToken, testCompany.id);
  });

  afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
  });

  describe('GET /api/jobs', () => {
    it('should return list of approved jobs (200)', async () => {
      const response = await request(app)
        .get('/api/jobs')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('data');
      expect(Array.isArray(response.body.data.data)).toBe(true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('page');
    });

    it('should filter jobs by type', async () => {
      const response = await request(app)
        .get('/api/jobs')
        .query({ type: 'FULL_TIME' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should search jobs by keyword', async () => {
      const response = await request(app)
        .get('/api/jobs')
        .query({ search: 'software' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/jobs/:id', () => {
    it('should return job details (200)', async () => {
      const response = await request(app)
        .get(`/api/jobs/${testJob.id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', testJob.id);
      expect(response.body.data).toHaveProperty('title', testJob.title);
      expect(response.body.data).toHaveProperty('description', testJob.description);
    });

    it('should return 404 for non-existent job', async () => {
      const response = await request(app)
        .get('/api/jobs/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/jobs', () => {
    it('should create job as employer (201)', async () => {
      const jobData = {
        title: 'New Job Position',
        description: 'This is a new job position for testing.',
        location: 'New York',
        type: 'CONTRACT',
        salaryMin: 50000,
        salaryMax: 70000,
        requirements: 'Some requirements',
        companyId: testCompany.id,
      };

      const response = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${employer.accessToken}`)
        .send(jobData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.title).toBe(jobData.title);
    });

    it('should fail without auth (401)', async () => {
      const jobData = {
        title: 'Unauthorized Job',
        description: 'Should not be created',
        location: 'Remote',
        type: 'FULL_TIME',
        companyId: testCompany.id,
      };

      const response = await request(app)
        .post('/api/jobs')
        .send(jobData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should fail as seeker (403)', async () => {
      const jobData = {
        title: 'Seeker Trying to Create Job',
        description: 'Should not be allowed',
        location: 'Remote',
        type: 'FULL_TIME',
        companyId: testCompany.id,
      };

      const response = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${seeker.accessToken}`)
        .send(jobData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/jobs/:id', () => {
    it('should update own job (200)', async () => {
      const updateData = {
        title: 'Updated Job Title',
        description: 'Updated description',
        location: 'San Francisco',
      };

      const response = await request(app)
        .put(`/api/jobs/${testJob.id}`)
        .set('Authorization', `Bearer ${employer.accessToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
    });

    it('should fail to update other user\'s job (403)', async () => {
      // Create another employer
      const anotherEmployer = await createTestUser(UserRole.EMPLOYER);
      
      const updateData = {
        title: 'Trying to update someone else\'s job',
      };

      const response = await request(app)
        .put(`/api/jobs/${testJob.id}`)
        .set('Authorization', `Bearer ${anotherEmployer.accessToken}`)
        .send(updateData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/jobs/:id', () => {
    it('should delete own job (200)', async () => {
      // Create a job to delete (helper auto-approves)
      const jobToDelete = await createTestJob(employer.accessToken, testCompany.id);
      
      const response = await request(app)
        .delete(`/api/jobs/${jobToDelete.id}`)
        .set('Authorization', `Bearer ${employer.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // Verify job is deleted
      const getResponse = await request(app)
        .get(`/api/jobs/${jobToDelete.id}`);
      
      expect(getResponse.status).toBe(404);
    });
  });

  describe('GET /api/jobs/search', () => {
    it('should search by keyword (200)', async () => {
      const response = await request(app)
        .get('/api/jobs/search')
        .query({ keyword: 'software' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      // Search returns { data, total, page, limit, totalPages }
      expect(response.body.data).toHaveProperty('data');
      expect(Array.isArray(response.body.data.data)).toBe(true);
    });

    it('should filter by type (200)', async () => {
      const response = await request(app)
        .get('/api/jobs/search')
        .query({ type: 'FULL_TIME' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
