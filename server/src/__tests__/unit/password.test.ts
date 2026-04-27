import { hashPassword, comparePassword, validatePasswordStrength } from '../../utils/password';

describe('Password Utilities', () => {
  describe('hashPassword', () => {
    it('should return a bcrypt hash', async () => {
      const password = 'Test@1234';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(10);
      // bcrypt hash format can be $2a$, $2b$, or $2y$
      expect(hash.startsWith('$2')).toBe(true);
    });
  });

  describe('comparePassword', () => {
    it('should return true for correct password', async () => {
      const password = 'Test@1234';
      const hash = await hashPassword(password);
      
      const result = await comparePassword(password, hash);
      expect(result).toBe(true);
    });

    it('should return false for wrong password', async () => {
      const password = 'Test@1234';
      const wrongPassword = 'Wrong@1234';
      const hash = await hashPassword(password);
      
      const result = await comparePassword(wrongPassword, hash);
      expect(result).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should return valid for strong password', () => {
      const password = 'Strong@Pass123';
      const result = validatePasswordStrength(password);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return error for too short password', () => {
      const password = 'Short1!';
      const result = validatePasswordStrength(password);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should return error for no uppercase', () => {
      const password = 'lowercase123!';
      const result = validatePasswordStrength(password);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should return error for no lowercase', () => {
      const password = 'UPPERCASE123!';
      const result = validatePasswordStrength(password);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should return error for no number', () => {
      const password = 'NoNumber@!';
      const result = validatePasswordStrength(password);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should return error for no special character', () => {
      const password = 'NoSpecial123';
      const result = validatePasswordStrength(password);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
    });

    it('should return multiple errors for very weak password', () => {
      const password = 'weak';
      const result = validatePasswordStrength(password);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });
});