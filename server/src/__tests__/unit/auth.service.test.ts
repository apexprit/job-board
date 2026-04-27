import { AuthService } from '../../services/auth.service';
import { UserRepository } from '../../repositories/user.repository';
import { CacheService } from '../../utils/cache';
import { UserRole } from '@prisma/client';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../middleware/auth.middleware';

// Mock dependencies
jest.mock('../../repositories/user.repository');
jest.mock('../../utils/cache');
jest.mock('../../middleware/auth.middleware');
jest.mock('../../utils/password', () => ({
  hashPassword: jest.fn(() => Promise.resolve('hashed_password')),
  comparePassword: jest.fn(() => Promise.resolve(true)),
  validatePasswordStrength: jest.fn(() => ({ valid: true, errors: [] })),
}));

const MockedUserRepository = UserRepository as jest.MockedClass<typeof UserRepository>;
const MockedCacheService = CacheService as jest.MockedClass<typeof CacheService>;
const mockedGenerateAccessToken = generateAccessToken as jest.MockedFunction<typeof generateAccessToken>;
const mockedGenerateRefreshToken = generateRefreshToken as jest.MockedFunction<typeof generateRefreshToken>;
const mockedVerifyRefreshToken = verifyRefreshToken as jest.MockedFunction<typeof verifyRefreshToken>;

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockCacheService: jest.Mocked<CacheService>;

  beforeEach(() => {
    mockUserRepository = new MockedUserRepository({} as any) as jest.Mocked<UserRepository>;
    mockCacheService = new MockedCacheService() as jest.Mocked<CacheService>;
    authService = new AuthService(mockUserRepository, mockCacheService);

    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    const validInput = {
      email: 'test@example.com',
      password: 'Test@1234',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.SEEKER,
    };

    it('should register a new user successfully', async () => {
      // Mock repository responses
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.SEEKER,
        avatarUrl: null,
        resumeUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Mock token generation
      mockedGenerateAccessToken.mockReturnValue('access_token');
      mockedGenerateRefreshToken.mockReturnValue('refresh_token');

      const result = await authService.registerUser(validInput);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.SEEKER,
      });
      expect(mockCacheService.set).toHaveBeenCalledWith(
        'refresh:user-123',
        'refresh_token',
        7 * 24 * 60 * 60
      );

      expect(result.user).toMatchObject({
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.SEEKER,
      });
      expect(result.accessToken).toBe('access_token');
      expect(result.refreshToken).toBe('refresh_token');
    });

    it('should throw error for duplicate email', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({
        id: 'existing-user',
        email: 'test@example.com',
        passwordHash: 'hash',
        firstName: 'Existing',
        lastName: 'User',
        role: UserRole.SEEKER,
        avatarUrl: null,
        resumeUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(authService.registerUser(validInput)).rejects.toThrow('Email already registered');
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error for weak password', async () => {
      const { validatePasswordStrength } = require('../../utils/password');
      (validatePasswordStrength as jest.Mock).mockReturnValue({
        valid: false,
        errors: ['Password must be at least 8 characters long'],
      });

      await expect(authService.registerUser(validInput)).rejects.toThrow(
        'Password validation failed: Password must be at least 8 characters long'
      );
    });
  });

  describe('loginUser', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      passwordHash: 'hashed_password',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.SEEKER,
      avatarUrl: null,
      resumeUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should login user successfully', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockedGenerateAccessToken.mockReturnValue('access_token');
      mockedGenerateRefreshToken.mockReturnValue('refresh_token');

      const result = await authService.loginUser('test@example.com', 'Test@1234');

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockCacheService.set).toHaveBeenCalledWith(
        'refresh:user-123',
        'refresh_token',
        7 * 24 * 60 * 60
      );

      expect(result.user).toMatchObject({
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.SEEKER,
      });
      expect(result.accessToken).toBe('access_token');
      expect(result.refreshToken).toBe('refresh_token');
    });

    it('should throw error for non-existent user', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(authService.loginUser('nonexistent@example.com', 'password')).rejects.toThrow(
        'Invalid email or password'
      );
    });

    it('should throw error for wrong password', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      const { comparePassword } = require('../../utils/password');
      (comparePassword as jest.Mock).mockResolvedValue(false);

      await expect(authService.loginUser('test@example.com', 'wrongpassword')).rejects.toThrow(
        'Invalid email or password'
      );
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh access token successfully', async () => {
      const mockPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: UserRole.SEEKER,
      };
      mockedVerifyRefreshToken.mockReturnValue(mockPayload);
      mockedGenerateAccessToken.mockReturnValue('new_access_token');

      // Mock cache to return the same token that was passed
      mockCacheService.get.mockResolvedValue('valid_refresh_token');
      
      // Mock user repository to return a user
      mockUserRepository.findById.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'hash',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.SEEKER,
        avatarUrl: null,
        resumeUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await authService.refreshAccessToken('valid_refresh_token');

      expect(mockedVerifyRefreshToken).toHaveBeenCalledWith('valid_refresh_token');
      expect(mockCacheService.get).toHaveBeenCalledWith('refresh:user-123');
      expect(mockUserRepository.findById).toHaveBeenCalledWith('user-123');
      expect(mockedGenerateAccessToken).toHaveBeenCalledWith(mockPayload);
      // Note: refreshAccessToken does not generate a new refresh token
      expect(result.accessToken).toBe('new_access_token');
    });

    it('should throw error for invalid refresh token', async () => {
      mockedVerifyRefreshToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.refreshAccessToken('invalid_token')).rejects.toThrow('Invalid token');
    });

    it('should throw error if cached token does not match', async () => {
      const mockPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: UserRole.SEEKER,
      };
      mockedVerifyRefreshToken.mockReturnValue(mockPayload);
      mockCacheService.get.mockResolvedValue('different_token');

      await expect(authService.refreshAccessToken('valid_token')).rejects.toThrow(
        'Invalid refresh token'
      );
    });
  });

  describe('getCurrentUser', () => {
    it('should return user if found', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'hash',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.SEEKER,
        avatarUrl: null,
        resumeUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await authService.getCurrentUser('user-123');

      expect(mockUserRepository.findById).toHaveBeenCalledWith('user-123');
      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.SEEKER,
        avatarUrl: null,
        resumeUrl: null,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });

    it('should throw error if user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(authService.getCurrentUser('non-existent')).rejects.toThrow('User not found');
    });
  });
});