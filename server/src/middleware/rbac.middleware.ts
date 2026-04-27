import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';

/**
 * Role-Based Access Control middleware
 * Checks if the authenticated user has one of the allowed roles
 */
export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if user is authenticated
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    // Check if user's role is in the allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: `You need one of these roles: ${allowedRoles.join(', ')}`
      });
      return;
    }

    next();
  };
}

/**
 * Convenience middleware for specific roles
 */
export const requireAdmin = authorize(UserRole.ADMIN);
export const requireEmployer = authorize(UserRole.EMPLOYER);
export const requireSeeker = authorize(UserRole.SEEKER);
export const requireAdminOrEmployer = authorize(UserRole.ADMIN, UserRole.EMPLOYER);
export const requireAdminOrSeeker = authorize(UserRole.ADMIN, UserRole.SEEKER);