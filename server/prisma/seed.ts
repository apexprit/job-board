import { PrismaClient } from '@prisma/client';
import { UserRole, JobType, JobStatus, ApplicationStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = 'password123';

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleared existing data');

  // Create users
  const adminPassword = await hashPassword(DEFAULT_PASSWORD);
  const employerPassword = await hashPassword(DEFAULT_PASSWORD);
  const seekerPassword = await hashPassword(DEFAULT_PASSWORD);

  const _admin = await prisma.user.create({
    data: {
      email: 'admin@jobboard.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    },
  });

  const employer = await prisma.user.create({
    data: {
      email: 'employer@techcorp.com',
      passwordHash: employerPassword,
      firstName: 'John',
      lastName: 'Employer',
      role: UserRole.EMPLOYER,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=employer',
    },
  });

  const seeker = await prisma.user.create({
    data: {
      email: 'seeker@example.com',
      passwordHash: seekerPassword,
      firstName: 'Alice',
      lastName: 'Seeker',
      role: UserRole.SEEKER,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=seeker',
      resumeUrl: 'https://example.com/resumes/alice.pdf',
    },
  });

  console.log('👥 Created 3 users');

  // Create companies
  const techCorp = await prisma.company.create({
    data: {
      name: 'TechCorp Inc.',
      description: 'Leading technology company specializing in software solutions.',
      logoUrl: 'https://logo.clearbit.com/techcorp.com',
      websiteUrl: 'https://techcorp.com',
      industry: 'Technology',
      location: 'San Francisco, CA',
    },
  });

  const startupLabs = await prisma.company.create({
    data: {
      name: 'StartupLabs',
      description: 'Innovative startup incubator and venture fund.',
      logoUrl: 'https://logo.clearbit.com/startuplabs.com',
      websiteUrl: 'https://startuplabs.com',
      industry: 'Venture Capital',
      location: 'New York, NY',
    },
  });

  console.log('🏢 Created 2 companies');

  // Create jobs
  const jobs = [
    {
      title: 'Senior Full-Stack Developer',
      description: 'We are looking for an experienced full-stack developer to join our team.',
      location: 'Remote',
      type: JobType.REMOTE,
      salaryMin: 120000,
      salaryMax: 180000,
      requirements: '5+ years experience with React, Node.js, and TypeScript.',
      companyId: techCorp.id,
      employerId: employer.id,
      status: JobStatus.APPROVED,
    },
    {
      title: 'Product Manager',
      description: 'Lead product development for our flagship SaaS platform.',
      location: 'San Francisco, CA',
      type: JobType.FULL_TIME,
      salaryMin: 140000,
      salaryMax: 200000,
      requirements: '3+ years product management experience, MBA preferred.',
      companyId: techCorp.id,
      employerId: employer.id,
      status: JobStatus.APPROVED,
    },
    {
      title: 'Marketing Intern',
      description: 'Summer internship for marketing students.',
      location: 'New York, NY',
      type: JobType.INTERNSHIP,
      salaryMin: 20000,
      salaryMax: 30000,
      requirements: 'Currently enrolled in a marketing or business program.',
      companyId: startupLabs.id,
      employerId: employer.id,
      status: JobStatus.PENDING,
    },
    {
      title: 'DevOps Engineer',
      description: 'Build and maintain our cloud infrastructure.',
      location: 'Remote',
      type: JobType.CONTRACT,
      salaryMin: 80000,
      salaryMax: 120000,
      requirements: 'Experience with AWS, Docker, Kubernetes.',
      companyId: techCorp.id,
      employerId: employer.id,
      status: JobStatus.APPROVED,
    },
    {
      title: 'Part-Time Customer Support',
      description: 'Provide customer support via chat and email.',
      location: 'Remote',
      type: JobType.PART_TIME,
      salaryMin: 25000,
      salaryMax: 35000,
      requirements: 'Excellent communication skills, previous support experience a plus.',
      companyId: startupLabs.id,
      employerId: employer.id,
      status: JobStatus.APPROVED,
    },
  ];

  const createdJobs = [];
  for (const jobData of jobs) {
    const job = await prisma.job.create({
      data: jobData,
    });
    createdJobs.push(job);
  }

  console.log('💼 Created 5 jobs');

  // Create applications
  const applications = [
    {
      coverLetter: 'I am very interested in this position and believe my skills are a perfect match.',
      jobId: createdJobs[0].id,
      seekerId: seeker.id,
      status: ApplicationStatus.PENDING,
      resumeUrl: 'https://example.com/resumes/alice.pdf',
    },
    {
      coverLetter: 'I have extensive experience in product management and would love to contribute.',
      jobId: createdJobs[1].id,
      seekerId: seeker.id,
      status: ApplicationStatus.REVIEWED,
      resumeUrl: 'https://example.com/resumes/alice.pdf',
    },
    {
      coverLetter: 'As a marketing student, this internship aligns perfectly with my career goals.',
      jobId: createdJobs[2].id,
      seekerId: seeker.id,
      status: ApplicationStatus.SHORTLISTED,
      resumeUrl: 'https://example.com/resumes/alice.pdf',
    },
  ];

  for (const appData of applications) {
    await prisma.application.create({
      data: appData,
    });
  }

  console.log('📄 Created 3 applications');

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });