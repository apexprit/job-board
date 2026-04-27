import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/rbac.middleware';
import {
  updateProfileSchema,
  changePasswordSchema,
  updateRoleSchema,
  updateStatusSchema,
} from '../validators/user.validator';
import { singleAvatarUpload, singleResumeUpload, getFileUrl } from '../middleware/upload.middleware';
import { UserService } from '../services/user.service';
import { UserRepository } from '../repositories/user.repository';
import { CacheService } from '../utils/cache';
import { prisma } from '../config/database';

const router = Router();

// Initialize services
const userRepository = new UserRepository(prisma);
const cacheService = new CacheService();
const userService = new UserService(userRepository, cacheService, prisma);

// Get current user profile
router.get('/me', authenticate, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const profile = await userService.getUserProfile(userId);
    res.json({ success: true, data: profile });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Update user profile
router.put('/me', authenticate, async (req, res) => {
  try {
    const validatedData = updateProfileSchema.parse(req.body);
    const userId = req.user!.userId;
    const updatedProfile = await userService.updateUserProfile(userId, validatedData);
    res.json({ success: true, data: updatedProfile });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Change password
router.post('/me/change-password', authenticate, async (req, res) => {
  try {
    const validatedData = changePasswordSchema.parse(req.body);
    const userId = req.user!.userId;
    const result = await userService.changePassword(userId, validatedData);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Upload avatar
router.post('/me/avatar', authenticate, (req, res) => {
  singleAvatarUpload(req, res, async (err) => {
    if (err) {
      res.status(400).json({ success: false, error: err.message });
      return;
    }
    
    if (!req.file) {
      res.status(400).json({ success: false, error: 'No file uploaded' });
      return;
    }

    try {
      const userId = req.user!.userId;
      const result = await userService.updateAvatar(userId, req.file.filename);
      const avatarUrl = getFileUrl(req.file.filename);
      res.json({ success: true, data: { ...result, url: avatarUrl } });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });
});

// Upload resume
router.post('/me/resume', authenticate, (req, res) => {
  singleResumeUpload(req, res, async (err) => {
    if (err) {
      res.status(400).json({ success: false, error: err.message });
      return;
    }
    
    if (!req.file) {
      res.status(400).json({ success: false, error: 'No file uploaded' });
      return;
    }

    try {
      const userId = req.user!.userId;
      const result = await userService.updateResume(userId, req.file.filename);
      const resumeUrl = getFileUrl(req.file.filename);
      res.json({ success: true, data: { ...result, url: resumeUrl } });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });
});

// Search users (admin only) — MUST be before /:id to avoid route shadowing
router.get('/search/all', authenticate, requireAdmin, async (req, res) => {
  try {
    const query = req.query.q as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Search query must be at least 2 characters' });
    }
    
    const result = await userService.searchUsers(query, page, limit);
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// Get user by ID (admin only)
router.get('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id as string;
    const profile = await userService.getUserProfile(userId);
    res.json({ success: true, data: profile });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get all users (admin only)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const role = req.query.role as string | undefined;
    
    const result = await userService.getAllUsers(page, limit, role as any);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Update user role (admin only)
router.put('/:id/role', authenticate, requireAdmin, async (req, res) => {
  try {
    const validatedData = updateRoleSchema.parse(req.body);
    const userId = req.params.id as string;
    const result = await userService.updateUserRole(userId, validatedData);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Update user status (admin only)
router.put('/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const validatedData = updateStatusSchema.parse(req.body);
    const userId = req.params.id as string;
    const result = await userService.updateUserStatus(userId, validatedData);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id as string;
    const result = await userService.deleteUser(userId);
    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

export default router;