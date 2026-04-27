import { registerSchema, loginSchema } from '../../validators/auth.validator';
import { createJobSchema } from '../../validators/job.validator';
import { createApplicationSchema } from '../../validators/application.validator';
import { UserRole, JobType } from '@prisma/client';

describe('Validators', () => {
  describe('Auth Validators', () => {
    describe('registerSchema', () => {
      it('should validate correct registration data', () => {
        const validData = {
          email: 'test@example.com',
          password: 'Password123!',
          firstName: 'John',
          lastName: 'Doe',
          role: UserRole.SEEKER,
        };

        const result = registerSchema.safeParse(validData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(validData);
        }
      });

      it('should default role to SEEKER if not provided', () => {
        const data = {
          email: 'test@example.com',
          password: 'Password123!',
          firstName: 'John',
          lastName: 'Doe',
        };

        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.role).toBe(UserRole.SEEKER);
        }
      });

      it('should reject invalid email', () => {
        const invalidData = {
          email: 'not-an-email',
          password: 'Password123!',
          firstName: 'John',
          lastName: 'Doe',
          role: UserRole.SEEKER,
        };

        const result = registerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('should reject short password', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'short',
          firstName: 'John',
          lastName: 'Doe',
          role: UserRole.SEEKER,
        };

        const result = registerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('should reject empty first name', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'Password123!',
          firstName: '',
          lastName: 'Doe',
          role: UserRole.SEEKER,
        };

        const result = registerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('should reject invalid role', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'Password123!',
          firstName: 'John',
          lastName: 'Doe',
          role: 'INVALID_ROLE' as any,
        };

        const result = registerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });

    describe('loginSchema', () => {
      it('should validate correct login data', () => {
        const validData = {
          email: 'test@example.com',
          password: 'anypassword',
        };

        const result = loginSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should reject invalid email', () => {
        const invalidData = {
          email: 'not-an-email',
          password: 'password',
        };

        const result = loginSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('should reject empty password', () => {
        const invalidData = {
          email: 'test@example.com',
          password: '',
        };

        const result = loginSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Job Validators', () => {
    describe('createJobSchema', () => {
      it('should validate correct job data', () => {
        const validData = {
          title: 'Software Engineer',
          description: 'We are looking for a skilled software engineer with 5+ years of experience.',
          location: 'Remote',
          type: JobType.FULL_TIME,
          salaryMin: 80000,
          salaryMax: 120000,
          requirements: '5+ years experience, React, Node.js',
          companyId: 'company-123',
        };

        const result = createJobSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should validate with optional fields missing', () => {
        const validData = {
          title: 'Software Engineer',
          description: 'We are looking for a skilled software engineer.',
          location: 'Remote',
          type: JobType.FULL_TIME,
          companyId: 'company-123',
        };

        const result = createJobSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should reject short title', () => {
        const invalidData = {
          title: 'Ab',
          description: 'Valid description',
          location: 'Remote',
          type: JobType.FULL_TIME,
          companyId: 'company-123',
        };

        const result = createJobSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('should reject short description', () => {
        const invalidData = {
          title: 'Software Engineer',
          description: 'Short',
          location: 'Remote',
          type: JobType.FULL_TIME,
          companyId: 'company-123',
        };

        const result = createJobSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('should reject empty location', () => {
        const invalidData = {
          title: 'Software Engineer',
          description: 'Valid description',
          location: '',
          type: JobType.FULL_TIME,
          companyId: 'company-123',
        };

        const result = createJobSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('should reject invalid job type', () => {
        const invalidData = {
          title: 'Software Engineer',
          description: 'Valid description',
          location: 'Remote',
          type: 'INVALID_TYPE' as any,
          companyId: 'company-123',
        };

        const result = createJobSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('should reject missing companyId', () => {
        const invalidData = {
          title: 'Software Engineer',
          description: 'Valid description',
          location: 'Remote',
          type: JobType.FULL_TIME,
          companyId: '',
        };

        const result = createJobSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Application Validators', () => {
    describe('createApplicationSchema', () => {
      it('should validate correct application data', () => {
        const validData = {
          jobId: 'job-123',
          coverLetter: 'I am very interested in this position.',
          resumeUrl: 'https://example.com/resume.pdf',
        };

        const result = createApplicationSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should validate with optional fields missing', () => {
        const validData = {
          jobId: 'job-123',
        };

        const result = createApplicationSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should reject empty jobId', () => {
        const invalidData = {
          jobId: '',
        };

        const result = createApplicationSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('should reject invalid resumeUrl format', () => {
        const invalidData = {
          jobId: 'job-123',
          resumeUrl: 'not-a-url',
        };

        const result = createApplicationSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });
  });
});