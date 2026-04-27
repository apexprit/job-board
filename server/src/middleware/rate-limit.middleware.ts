import { Request, Response, NextFunction } from 'express';
import { CacheService } from '../utils/cache';

const cacheService = new CacheService();

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: Request) => string; // Custom key generator
  skip?: (req: Request) => boolean; // Function to skip rate limiting
  message?: string; // Custom error message
}

const defaultOptions: RateLimitOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per window
  message: 'Too many requests, please try again later.',
};

/**
 * Redis-based rate limiting middleware
 */
export function rateLimit(options: Partial<RateLimitOptions> = {}) {
  const opts: RateLimitOptions = { ...defaultOptions, ...options };
  
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Skip rate limiting if skip function returns true
      if (opts.skip && opts.skip(req)) {
        return next();
      }

      // Generate rate limit key
      const key = opts.keyGenerator 
        ? opts.keyGenerator(req) 
        : generateDefaultKey(req);
      
      // Get current count from Redis
      const currentCount = await getRequestCount(key);
      
      // Check if rate limit exceeded
      if (currentCount >= opts.maxRequests) {
        return res.status(429).json({
          success: false,
          error: opts.message,
          retryAfter: Math.ceil(opts.windowMs / 1000), // seconds
        });
      }
      
      // Increment request count
      await incrementRequestCount(key, opts.windowMs);
      
      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', opts.maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', (opts.maxRequests - currentCount - 1).toString());
      res.setHeader('X-RateLimit-Reset', Math.floor((Date.now() + opts.windowMs) / 1000).toString());
      
      next();
    } catch (error) {
      // If Redis fails, allow the request (fail-open)
      console.error('Rate limiting error:', error);
      next();
    }
  };
}

/**
 * Generate default rate limit key based on IP and route
 */
function generateDefaultKey(req: Request): string {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const route = req.route?.path || req.path;
  return `rate-limit:${ip}:${route}`;
}

/**
 * Get current request count from Redis
 */
async function getRequestCount(key: string): Promise<number> {
  try {
    const count = await cacheService.get<number>(key);
    return count || 0;
  } catch (error) {
    console.error('Error getting request count:', error);
    return 0;
  }
}

/**
 * Increment request count in Redis with TTL
 */
async function incrementRequestCount(key: string, windowMs: number): Promise<void> {
  try {
    const ttlSeconds = Math.ceil(windowMs / 1000);
    
    // Use Redis INCR command pattern
    const current = await getRequestCount(key);
    await cacheService.set(key, current + 1, ttlSeconds);
  } catch (error) {
    console.error('Error incrementing request count:', error);
  }
}

/**
 * Strict rate limiting for sensitive endpoints (login, registration, etc.)
 */
export function strictRateLimit() {
  return rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // 10 requests per hour
    message: 'Too many attempts, please try again later.',
  });
}

/**
 * Public API rate limiting (more generous)
 */
export function publicRateLimit() {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per window
    message: 'API rate limit exceeded. Please try again later.',
  });
}

/**
 * Admin rate limiting (very generous)
 */
export function adminRateLimit() {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 500, // 500 requests per window
    message: 'Admin API rate limit exceeded.',
  });
}