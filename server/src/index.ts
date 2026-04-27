import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import yaml from 'yamljs';
import authRoutes from './routes/auth.routes';
import jobRoutes from './routes/job.routes';
import applicationRoutes from './routes/application.routes';
import companyRoutes from './routes/company.routes';
import userRoutes from './routes/user.routes';
import moderationRoutes from './routes/moderation.routes';
import { publicRateLimit, strictRateLimit } from './middleware/rate-limit.middleware';
import { errorHandler, notFoundHandler } from './middleware/error-handler.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy — required for Render's reverse proxy (and other cloud providers)
app.set('trust proxy', 1);

// Security headers via Helmet
app.use(helmet());

// CORS configuration — parse comma-separated origins from env
const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: corsOrigins,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all routes (public rate limit)
app.use(publicRateLimit());

// Apply strict rate limiting to auth routes
app.use('/api/auth', strictRateLimit());

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Job Board API',
    version: '1.0.0'
  });
});

// Swagger API Documentation — only available in development
if (process.env.NODE_ENV !== 'production') {
  const swaggerPath = path.resolve(process.cwd(), 'src/docs/openapi.yaml');
  const swaggerDocument = yaml.load(swaggerPath);
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// Auth routes
app.use('/api/auth', authRoutes);

// Job routes
app.use('/api/jobs', jobRoutes);

// Application routes
app.use('/api/applications', applicationRoutes);

// Company routes
app.use('/api/companies', companyRoutes);

// User routes
app.use('/api/users', userRoutes);

// Moderation routes (admin only)
app.use('/api/moderation', moderationRoutes);

// Basic route
app.get('/', (_req: Request, res: Response) => {
  res.send('Job Board API is running');
});

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Error handler (must be last middleware)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
