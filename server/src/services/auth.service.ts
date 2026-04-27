import { UserRepository } from '../repositories';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../middleware/auth.middleware';
import { CacheService } from '../utils/cache';
import { RegisterInput } from '../validators/auth.validator';
import { UserRole } from '@prisma/client';

export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private cacheService: CacheService
  ) {}

  /**
   * Register a new user
   */
  async registerUser(data: RegisterInput) {
    // Validate password strength
    const passwordValidation = validatePasswordStrength(data.password);
    if (!passwordValidation.valid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }

    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await this.userRepository.create({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
    });

    // Store refresh token in cache (optional, for invalidation)
    await this.cacheService.set(`refresh:${user.id}`, refreshToken, 7 * 24 * 60 * 60); // 7 days

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Login user
   */
  async loginUser(email: string, password: string) {
    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const passwordValid = await comparePassword(password, user.passwordHash);
    if (!passwordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
    });

    // Store refresh token in cache
    await this.cacheService.set(`refresh:${user.id}`, refreshToken, 7 * 24 * 60 * 60);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string) {
    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    // Check if refresh token is blacklisted (optional)
    const cachedToken = await this.cacheService.get(`refresh:${payload.userId}`);
    if (cachedToken !== refreshToken) {
      throw new Error('Invalid refresh token');
    }

    // Find user
    const user = await this.userRepository.findById(payload.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
    });

    return { accessToken };
  }

  /**
   * Logout user (invalidate refresh token)
   */
  async logoutUser(userId: string) {
    await this.cacheService.del(`refresh:${userId}`);
    return { success: true };
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatarUrl: user.avatarUrl,
      resumeUrl: user.resumeUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}