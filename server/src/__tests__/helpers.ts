import request from 'supertest';
import app from '../index';
import { prisma } from '../config/database';
import { UserRole, JobStatus } from '@prisma/client';

export interface TestUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  accessToken: string;
  refreshToken: string;
}

export interface TestJob {
  id: string;
  title: string;
  description: string;
  location: string;
  type: string;
  companyId: string;
}

export interface TestCompany {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  logoUrl?: string;
  industry?: string;
  location?: string;
}

/**
 * Create a test user with the specified role and return user data + tokens
 */
export async function createTestUser(role: UserRole = UserRole.SEEKER): Promise<TestUser> {
  const email = `test-${Date.now()}-${Math.random()}@example.com`;
  const password = 'Test@1234';
  
  const response = await request(app)
    .post('/api/auth/register')
    .send({
      email,
      password,
      firstName: 'Test',
      lastName: 'User',
      role,
    });

  if (response.status !== 201) {
    throw new Error(`Failed to create test user: ${response.body.error}`);
  }

  return {
    id: response.body.data.user.id,
    email,
    firstName: 'Test',
    lastName: 'User',
    role,
    accessToken: response.body.data.accessToken,
    refreshToken: response.body.data.refreshToken,
  };
}

/**
 * Create a test job using an employer's token
 */
export async function createTestJob(employerToken: string, companyId?: string): Promise<TestJob> {
  // If no companyId provided, create a test company first
  let actualCompanyId = companyId;
  if (!actualCompanyId) {
    const company = await createTestCompany(employerToken);
    actualCompanyId = company.id;
  }

  const jobData = {
    title: 'Software Engineer',
    description: 'We are looking for a skilled software engineer with 5+ years of experience.',
    location: 'Remote',
    type: 'FULL_TIME',
    salaryMin: 80000,
    salaryMax: 120000,
    requirements: '5+ years experience, React, Node.js',
    companyId: actualCompanyId,
  };

  const response = await request(app)
    .post('/api/jobs')
    .set('Authorization', `Bearer ${employerToken}`)
    .send(jobData);

  if (response.status !== 201) {
    throw new Error(`Failed to create test job: ${response.body.error}`);
  }

  // Approve the job so it appears in public listings
  const jobId = response.body.data.id;
  await prisma.job.update({
    where: { id: jobId },
    data: { status: JobStatus.APPROVED },
  });

  return {
    id: jobId,
    ...jobData,
  };
}

/**
 * Create a test company using a user's token
 */
export async function createTestCompany(token: string): Promise<TestCompany> {
  const companyData = {
    name: `Test Company ${Date.now()}`,
    description: 'A test company for integration tests',
    websiteUrl: 'https://example.com',
    logoUrl: 'https://example.com/logo.png',
    industry: 'Technology',
    location: 'Remote',
  };

  const response = await request(app)
    .post('/api/companies')
    .set('Authorization', `Bearer ${token}`)
    .send(companyData);

  if (response.status !== 201) {
    throw new Error(`Failed to create test company: ${response.status} - ${JSON.stringify(response.body)}`);
  }

  return {
    id: response.body.data.id,
    ...companyData,
  };
}

/**
 * Clean the test database by deleting all records in all tables
 */
export async function cleanDatabase(): Promise<void> {
  // Delete in reverse order to respect foreign key constraints
  try {
    await prisma.application.deleteMany();
  } catch (error) {
    console.warn('Failed to clean table application:', error);
  }
  
  try {
    await prisma.job.deleteMany();
  } catch (error) {
    console.warn('Failed to clean table job:', error);
  }
  
  try {
    await prisma.company.deleteMany();
  } catch (error) {
    console.warn('Failed to clean table company:', error);
  }
  
  try {
    await prisma.user.deleteMany();
  } catch (error) {
    console.warn('Failed to clean table user:', error);
  }
}

/**
 * Get authentication headers for a test user
 */
export function getAuthHeaders(token: string): { Authorization: string } {
  return {
    Authorization: `Bearer ${token}`,
  };
}