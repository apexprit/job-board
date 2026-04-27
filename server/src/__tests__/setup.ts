import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Override environment variables for tests
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'file:./test.db';
process.env.JWT_SECRET = 'test-jwt-secret-min-32-chars-long-here-123';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-min-32-chars-long-here-456';
process.env.JWT_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.CORS_ORIGIN = 'http://localhost:5173';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.HOST = 'localhost';
process.env.PORT = '0'; // Use port 0 to let OS assign random available port
process.env.LOG_LEVEL = 'error';