import request from 'supertest';
import app from '../../index';
import { createTestUser, cleanDatabase } from '../helpers';
import { UserRole } from '@prisma/client';

describe('Companies API Integration Tests', () => {
  let seeker: any;
  let employer: any;
  let admin: any;
  let testCompany: any;

  beforeAll(async () => {
    await cleanDatabase();
    
    // Create test users
    seeker = await createTestUser(UserRole.SEEKER);
    employer = await createTestUser(UserRole.EMPLOYER);
    admin = await createTestUser(UserRole.ADMIN);
  });

  afterAll(async () => {
    await cleanDatabase();
  });

  describe('GET /api/companies', () => {
    it('should list companies (200)', async () => {
      const response = await request(app)
        .get('/api/companies')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('data');
      expect(Array.isArray(response.body.data.data)).toBe(true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('page');
    });

    it('should search companies by name', async () => {
      const response = await request(app)
        .get('/api/companies')
        .query({ search: 'test' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/companies/:id', () => {
    it('should return company details (200)', async () => {
      // First create a company
      const companyData = {
        name: 'Test Company for Details',
        description: 'A company to test details endpoint',
        websiteUrl: 'https://testcompany.com',
        logoUrl: 'https://testcompany.com/logo.png',
      };

      const createResponse = await request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${employer.accessToken}`)
        .send(companyData);

      expect(createResponse.status).toBe(201);
      const companyId = createResponse.body.data.id;

      // Now get the company details
      const response = await request(app)
        .get(`/api/companies/${companyId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', companyId);
      expect(response.body.data).toHaveProperty('name', companyData.name);
      expect(response.body.data).toHaveProperty('description', companyData.description);
    });

    it('should return 404 for non-existent company', async () => {
      const response = await request(app)
        .get('/api/companies/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/companies', () => {
    it('should create company as employer (201)', async () => {
      const companyData = {
        name: 'New Test Company',
        description: 'This is a new test company created via API',
        websiteUrl: 'https://newtestcompany.com',
        logoUrl: 'https://newtestcompany.com/logo.png',
      };

      const response = await request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${employer.accessToken}`)
        .send(companyData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(companyData.name);
      expect(response.body.data.description).toBe(companyData.description);

      // Save for later tests
      testCompany = response.body.data;
    });

    it('should create company as admin (201)', async () => {
      const companyData = {
        name: 'Admin Created Company',
        description: 'Company created by admin',
        websiteUrl: 'https://admincompany.com',
      };

      const response = await request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send(companyData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should fail without auth (401)', async () => {
      const companyData = {
        name: 'Unauthorized Company',
        description: 'Should not be created',
        websiteUrl: 'https://unauthorized.com',
      };

      const response = await request(app)
        .post('/api/companies')
        .send(companyData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should fail as seeker (403)', async () => {
      const companyData = {
        name: 'Seeker Trying to Create Company',
        description: 'Should not be allowed',
        websiteUrl: 'https://seekercompany.com',
      };

      const response = await request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${seeker.accessToken}`)
        .send(companyData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid data (400)', async () => {
      const invalidData = {
        name: '', // Empty name
        description: 'Invalid company',
        websiteUrl: 'not-a-url',
      };

      const response = await request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${employer.accessToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/companies/:id', () => {
    it('should update company as admin (200)', async () => {
      const updateData = {
        name: 'Updated Company Name',
        description: 'Updated description',
        websiteUrl: 'https://updatedcompany.com',
      };

      const response = await request(app)
        .put(`/api/companies/${testCompany.id}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
    });

    it('should fail for employer update (403) - admin only', async () => {
      const updateData = {
        description: 'Trying to update as employer',
      };

      const response = await request(app)
        .put(`/api/companies/${testCompany.id}`)
        .set('Authorization', `Bearer ${employer.accessToken}`)
        .send(updateData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should fail without auth (401)', async () => {
      const updateData = {
        name: 'Unauthorized update',
      };

      const response = await request(app)
        .put(`/api/companies/${testCompany.id}`)
        .send(updateData);

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/companies/:id', () => {
    it('should delete company as admin (200)', async () => {
      // Create a company to delete
      const companyData = {
        name: 'Company to Delete',
        description: 'This company will be deleted',
        websiteUrl: 'https://todelete.com',
      };

      const createResponse = await request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${employer.accessToken}`)
        .send(companyData);

      const companyId = createResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/companies/${companyId}`)
        .set('Authorization', `Bearer ${admin.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // Verify company is deleted
      const getResponse = await request(app)
        .get(`/api/companies/${companyId}`);
      
      expect(getResponse.status).toBe(404);
    });

    it('should fail for employer delete (403) - admin only', async () => {
      const response = await request(app)
        .delete(`/api/companies/${testCompany.id}`)
        .set('Authorization', `Bearer ${employer.accessToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should fail without auth (401)', async () => {
      const response = await request(app)
        .delete(`/api/companies/${testCompany.id}`);

      expect(response.status).toBe(401);
    });
  });
});
