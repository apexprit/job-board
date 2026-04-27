import { Router } from 'express';
import { AuthService } from '../services/auth.service';
import { UserRepository } from '../repositories';
import { CacheService } from '../utils/cache';
import { registerSchema, loginSchema, refreshSchema } from '../validators/auth.validator';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import { prisma } from '../config/database';

const router = Router();

// Initialize services
const userRepository = new UserRepository(prisma);
const cacheService = new CacheService();
const authService = new AuthService(userRepository, cacheService);

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    // Validate request body
    const validatedData = registerSchema.parse(req.body);

    // Register user
    const result = await authService.registerUser(validatedData);

    res.status(201).json({
      success: true,
      data: result,
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

    if (error.message === 'Email already registered') {
      res.status(409).json({
        success: false,
        error: error.message,
      });
      return;
    }

    if (error.message.includes('Password validation failed')) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
      return;
    }

    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', async (req, res) => {
  try {
    // Validate request body
    const validatedData = loginSchema.parse(req.body);

    // Login user
    const result = await authService.loginUser(validatedData.email, validatedData.password);

    res.status(200).json({
      success: true,
      data: result,
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

    if (error.message === 'Invalid email or password') {
      res.status(401).json({
        success: false,
        error: error.message,
      });
      return;
    }

    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req, res) => {
  try {
    // Validate request body
    const validatedData = refreshSchema.parse(req.body);

    // Refresh token
    const result = await authService.refreshAccessToken(validatedData.refreshToken);

    res.status(200).json({
      success: true,
      data: result,
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

    if (error.message === 'Invalid refresh token' || error.message === 'Invalid or expired refresh token' || error.message === 'User not found') {
      res.status(401).json({
        success: false,
        error: error.message,
      });
      return;
    }

    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user (invalidate refresh token)
 */
router.post('/logout', optionalAuth, async (req, res) => {
  try {
    if (!req.user) {
      res.status(200).json({
        success: true,
        message: 'No active session',
      });
      return;
    }

    await authService.logoutUser(req.user.userId);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await authService.getCurrentUser(req.user!.userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    if (error.message === 'User not found') {
      res.status(404).json({
        success: false,
        error: error.message,
      });
      return;
    }

    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;