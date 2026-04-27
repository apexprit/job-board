import { UserRepository } from '../repositories/user.repository';
import { hashPassword, comparePassword } from '../utils/password';
import { CacheService } from '../utils/cache';
import {
  UpdateProfileInput,
  UpdateRoleInput,
  UpdateStatusInput,
  ChangePasswordInput,
} from '../validators/user.validator';
import { UserRole } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

export class UserService {
  constructor(
    private userRepository: UserRepository,
    private cacheService: CacheService,
    private prisma: PrismaClient
  ) {}

  // Get user profile by ID
  async getUserProfile(userId: string) {
    const cacheKey = `user:profile:${userId}`;
    
    return this.cacheService.getOrSet(cacheKey, async () => {
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      // Remove sensitive data
      const { password, refreshToken, ...userProfile } = user;
      return userProfile;
    }, 300); // 5 minute cache
  }

  // Update user profile
  async updateUserProfile(userId: string, data: UpdateProfileInput) {
    // Validate that at least one field is being updated
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined && value !== null)
    );

    if (Object.keys(updateData).length === 0) {
      throw new Error('No valid fields to update');
    }

    const updatedUser = await this.userRepository.update(userId, updateData);
    
    // Clear cache
    await this.cacheService.del(`user:profile:${userId}`);
    
    // Remove sensitive data
    const { password, refreshToken, ...userProfile } = updatedUser;
    return userProfile;
  }

  // Change password
  async changePassword(userId: string, data: ChangePasswordInput) {
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isPasswordValid = await comparePassword(
      data.currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await hashPassword(data.newPassword);

    // Update password
    await this.userRepository.update(userId, { password: hashedPassword });

    // Clear any cached user data
    await this.cacheService.del(`user:profile:${userId}`);

    return { success: true, message: 'Password updated successfully' };
  }

  // Upload avatar (filename update)
  async updateAvatar(userId: string, avatarFilename: string) {
    const updatedUser = await this.userRepository.update(userId, { avatar: avatarFilename });
    
    // Clear cache
    await this.cacheService.del(`user:profile:${userId}`);
    
    return { avatar: updatedUser.avatar };
  }

  // Upload resume (filename update)
  async updateResume(userId: string, resumeFilename: string) {
    const updatedUser = await this.userRepository.update(userId, { resume: resumeFilename });
    
    // Clear cache
    await this.cacheService.del(`user:profile:${userId}`);
    
    return { resume: updatedUser.resume };
  }

  // Get all users (admin only)
  async getAllUsers(page: number = 1, limit: number = 20, role?: UserRole) {
    const skip = (page - 1) * limit;
    
    const where = role ? { role } : {};
    
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Update user role (admin only)
  async updateUserRole(userId: string, data: UpdateRoleInput) {
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = await this.userRepository.update(userId, { role: data.role });
    
    // Clear cache
    await this.cacheService.del(`user:profile:${userId}`);
    
    return {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
    };
  }

  // Update user status (admin only)
  // NOTE: isActive and isVerified fields don't exist in the current User schema.
  // This method is kept as a placeholder for future schema migration.
  async updateUserStatus(userId: string, _data: UpdateStatusInput) {
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // No status fields to update in current schema - just return current user
    await this.cacheService.del(`user:profile:${userId}`);
    
    return {
      id: user.id,
      email: user.email,
    };
  }

  // Delete user (admin only)
  async deleteUser(userId: string) {
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Don't allow self-deletion through API (should be handled separately)
    await this.userRepository.delete(userId);
    
    // Clear cache
    await this.cacheService.del(`user:profile:${userId}`);
    
    return { success: true, message: 'User deleted successfully' };
  }

  // Search users (admin only)
  async searchUsers(query: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    const where = {
      OR: [
        { email: { contains: query } },
        { firstName: { contains: query } },
        { lastName: { contains: query } },
      ],
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          avatarUrl: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}