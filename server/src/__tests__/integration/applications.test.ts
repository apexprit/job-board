import request from 'supertest';
import app from '../../index';
import { createTestUser, createTestJob, createTestCompany, cleanDatabase } from '../helpers';
import { UserRole } from '@prisma/client';

describe('Applications API Integration Tests', () => {
  let seeker: any;
  let employer: any;
  let testJob: any;
  let testCompany: any;
  let testApplication: any;

  beforeAll(async () => {
    await cleanDatabase();
    
    // Create test users
    seeker = await createTestUser(UserRole.SEEKER);
    employer = await createTestUser(UserRole.EMPLOYER);
    
    // Create a test company and job
    testCompany = await createTestCompany(employer.accessToken);
    testJob = await createTestJob(employer.accessToken, testCompany.id);
  });

  afterAll(async () => {
    await cleanDatabase();
  });

  describe('POST /api/applications', () => {
    it('should apply for job as seeker (201)', async () => {
      const applicationData = {
        jobId: testJob.id,
        coverLetter: 'I am very interested in this position and believe I have the required skills.',
        resumeUrl: 'https://example.com/resume.pdf',
      };

      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${seeker.accessToken}`)
        .send(applicationData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.jobId).toBe(testJob.id);
      expect(response.body.data.seekerId).toBe(seeker.id);
      expect(response.body.data.status).toBe('PENDING');

      // Save for later tests
      testApplication = response.body.data;
    });

    it('should fail duplicate application (409)', async () => {
      const applicationData = {
        jobId: testJob.id,
        coverLetter: 'Another application for the same job',
      };

      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${seeker.accessToken}`)
        .send(applicationData);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('already applied');
    });

    it('should fail without auth (401)', async () => {
      const response = await request(app)
        .post('/api/applications')
        .send({ jobId: testJob.id });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should fail for non-existent job (404)', async () => {
      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${seeker.accessToken}`)
        .send({ jobId: 'non-existent-job-id' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/applications/seeker', () => {
    it('should list own applications (200)', async () => {
      const response = await request(app)
        .get('/api/applications/seeker')
        .set('Authorization', `Bearer ${seeker.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      // Service returns paginated result: { data, total, page, limit, totalPages }
      expect(Array.isArray(response.body.data.data)).toBe(true);
      expect(response.body.data.data.length).toBeGreaterThan(0);
      expect(response.body.data.data[0]).toHaveProperty('id');
      expect(response.body.data.data[0]).toHaveProperty('job');
    });

    it('should fail without auth (401)', async () => {
      const response = await request(app)
        .get('/api/applications/seeker');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/applications/:id/status', () => {
    it('should update status as employer (200)', async () => {
      const updateData = {
        status: 'REVIEWED',
        reason: 'Application looks promising',
      };

      const response = await request(app)
        .patch(`/api/applications/${testApplication.id}/status`)
        .set('Authorization', `Bearer ${employer.accessToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(updateData.status);
    });

    it('should fail for seeker updating status (403)', async () => {
      const updateData = {
        status: 'HIRED',
      };

      const response = await request(app)
        .patch(`/api/applications/${testApplication.id}/status`)
        .set('Authorization', `Bearer ${seeker.accessToken}`)
        .send(updateData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should fail for non-existent application (404)', async () => {
      const response = await request(app)
        .patch('/api/applications/non-existent-id/status')
        .set('Authorization', `Bearer ${employer.accessToken}`)
        .send({ status: 'REVIEWED' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/applications/job/:jobId', () => {
    it('should list applications for a job as employer (200)', async () => {
      const response = await request(app)
        .get(`/api/applications/job/${testJob.id}`)
        .set('Authorization', `Bearer ${employer.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      // Service returns paginated result: { data, total, page, limit, totalPages }
      expect(Array.isArray(response.body.data.data)).toBe(true);
      expect(response.body.data.data.length).toBeGreaterThan(0);
    });

    it('should fail for unauthorized access (403)', async () => {
      // Create another employer who doesn't own the job
      const anotherEmployer = await createTestUser(UserRole.EMPLOYER);
      
      const response = await request(app)
        .get(`/api/applications/job/${testJob.id}`)
        .set('Authorization', `Bearer ${anotherEmployer.accessToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
});
