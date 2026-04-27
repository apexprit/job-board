import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  changePasswordSchema,
  emailSchema,
  passwordSchema,
  nameSchema,
} from './index';

describe('Validation Schemas', () => {
  describe('emailSchema', () => {
    it('validates a valid email', () => {
      const result = emailSchema.safeParse('test@example.com');
      expect(result.success).toBe(true);
    });

    it('rejects empty string', () => {
      const result = emailSchema.safeParse('');
      expect(result.success).toBe(false);
    });

    it('rejects invalid email format', () => {
      const result = emailSchema.safeParse('not-an-email');
      expect(result.success).toBe(false);
    });

    it('rejects email without domain', () => {
      const result = emailSchema.safeParse('user@');
      expect(result.success).toBe(false);
    });
  });

  describe('passwordSchema', () => {
    it('validates a strong password', () => {
      const result = passwordSchema.safeParse('Password1!');
      expect(result.success).toBe(true);
    });

    it('rejects empty string', () => {
      const result = passwordSchema.safeParse('');
      expect(result.success).toBe(false);
    });

    it('rejects password shorter than 8 characters', () => {
      const result = passwordSchema.safeParse('Pass1!');
      expect(result.success).toBe(false);
    });

    it('rejects password without uppercase', () => {
      const result = passwordSchema.safeParse('password1!');
      expect(result.success).toBe(false);
    });

    it('rejects password without lowercase', () => {
      const result = passwordSchema.safeParse('PASSWORD1!');
      expect(result.success).toBe(false);
    });

    it('rejects password without number', () => {
      const result = passwordSchema.safeParse('Password!');
      expect(result.success).toBe(false);
    });

    it('rejects password without special character', () => {
      const result = passwordSchema.safeParse('Password1');
      expect(result.success).toBe(false);
    });
  });

  describe('nameSchema', () => {
    it('validates a valid name', () => {
      const result = nameSchema.safeParse('John Doe');
      expect(result.success).toBe(true);
    });

    it('rejects empty string', () => {
      const result = nameSchema.safeParse('');
      expect(result.success).toBe(false);
    });

    it('rejects single character name', () => {
      const result = nameSchema.safeParse('J');
      expect(result.success).toBe(false);
    });

    it('rejects name over 100 characters', () => {
      const result = nameSchema.safeParse('a'.repeat(101));
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('validates valid login data', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'anypassword',
      });
      expect(result.success).toBe(true);
    });

    it('rejects missing email', () => {
      const result = loginSchema.safeParse({
        password: 'anypassword',
      });
      expect(result.success).toBe(false);
    });

    it('rejects missing password', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid email format', () => {
      const result = loginSchema.safeParse({
        email: 'not-email',
        password: 'anypassword',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password1!',
      role: 'candidate' as const,
    };

    it('validates valid registration data', () => {
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('validates employer role', () => {
      const result = registerSchema.safeParse({ ...validData, role: 'employer' });
      expect(result.success).toBe(true);
    });

    it('rejects invalid role', () => {
      const result = registerSchema.safeParse({ ...validData, role: 'admin' });
      expect(result.success).toBe(false);
    });

    it('rejects weak password', () => {
      const result = registerSchema.safeParse({ ...validData, password: 'weak' });
      expect(result.success).toBe(false);
    });

    it('allows optional companyName', () => {
      const result = registerSchema.safeParse({ ...validData, companyName: 'Acme Inc' });
      expect(result.success).toBe(true);
    });
  });

  describe('changePasswordSchema', () => {
    it('validates matching passwords', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'OldPassword1!',
        newPassword: 'NewPassword1!',
        confirmPassword: 'NewPassword1!',
      });
      expect(result.success).toBe(true);
    });

    it('rejects mismatched passwords', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'OldPassword1!',
        newPassword: 'NewPassword1!',
        confirmPassword: 'DifferentPassword1!',
      });
      expect(result.success).toBe(false);
    });

    it('rejects weak new password', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'OldPassword1!',
        newPassword: 'weak',
        confirmPassword: 'weak',
      });
      expect(result.success).toBe(false);
    });
  });
});
