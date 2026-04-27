import request from 'supertest';
import app from '../index';
import { prisma } from '../config/database';
import { hashPassword } from '../utils/password';
import { UserRole } from '@prisma/client';

describe('Auth API', () => {
  beforeAll(async () => {
    // Clear database before tests
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Test@1234',
          firstName: 'John',
          lastName: 'Doe',
          role: UserRole.SEEKER,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.user.firstName).toBe('John');
      expect(response.body.data.user.lastName).toBe('Doe');
      expect(response.body.data.user.role).toBe(UserRole.SEEKER);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('should return 409 for duplicate email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Test@1234',
          firstName: 'Jane',
          lastName: 'Doe',
          role: UserRole.SEEKER,
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Email already registered');
    });

    it('should return 400 for invalid input', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'short',
          firstName: '',
          lastName: '',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should return 400 for weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test2@example.com',
          password: 'weak',
          firstName: 'Jane',
          lastName: 'Smith',
          role: UserRole.SEEKER,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      // Zod catches short password before service-level validation
      expect(response.body.error).toContain('Validation failed');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeAll(async () => {
      // Create a user for login tests
      const hashedPassword = await hashPassword('Test@1234');
      await prisma.user.create({
        data: {
          email: 'login@example.com',
          passwordHash: hashedPassword,
          firstName: 'Login',
          lastName: 'User',
          role: UserRole.SEEKER,
        },
      });
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'Test@1234',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('login@example.com');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('should return 401 for wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'WrongPassword@123',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid email or password');
    });

    it('should return 401 for non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test@1234',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid email or password');
    });

    it('should return 400 for invalid input', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: '',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('POST /api/auth/refresh', () => {
    let refreshToken: string;

    beforeAll(async () => {
      // Create a user and get refresh token
      const hashedPassword = await hashPassword('Test@1234');
      await prisma.user.create({
        data: {
          email: 'refresh@example.com',
          passwordHash: hashedPassword,
          firstName: 'Refresh',
          lastName: 'User',
          role: UserRole.SEEKER,
        },
      });

      // Login to get refresh token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'refresh@example.com',
          password: 'Test@1234',
        });

      refreshToken = loginResponse.body.data.refreshToken;
    });

    it('should refresh access token successfully', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
    });

    it('should return 401 for invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: 'invalid-token',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid or expired refresh token');
    });

    it('should return 400 for invalid input', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: '',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('GET /api/auth/me', () => {
    let accessToken: string;

    beforeAll(async () => {
      // Create a user and get access token
      const hashedPassword = await hashPassword('Test@1234');
      await prisma.user.create({
        data: {
          email: 'me@example.com',
          passwordHash: hashedPassword,
          firstName: 'Me',
          lastName: 'User',
          role: UserRole.SEEKER,
        },
      });

      // Login to get access token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'me@example.com',
          password: 'Test@1234',
        });

      accessToken = loginResponse.body.data.accessToken;
    });

    it('should return current user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('me@example.com');
      expect(response.body.data.firstName).toBe('Me');
      expect(response.body.data.lastName).toBe('User');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Authentication required');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid or expired token');
    });
  });

  describe('POST /api/auth/logout', () => {
    let accessToken: string;

    beforeAll(async () => {
      // Create a user and get access token
      const hashedPassword = await hashPassword('Test@1234');
      await prisma.user.create({
        data: {
          email: 'logout@example.com',
          passwordHash: hashedPassword,
          firstName: 'Logout',
          lastName: 'User',
          role: UserRole.SEEKER,
        },
      });

      // Login to get access token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logout@example.com',
          password: 'Test@1234',
        });

      accessToken = loginResponse.body.data.accessToken;
    });

    it('should logout successfully with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logged out successfully');
    });

    it('should handle logout without token', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('No active session');
    });
  });
});