import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { apiRateLimiter } from './middleware/rateLimiter';
import { config } from './config';

export const createApp = () => {
  const app = express();

  // Security Middleware
  app.use(helmet({
    contentSecurityPolicy: false // Allowed for development & API visualizations
  }));

  // CORS Configuration
  app.use(cors({
    origin: '*',
    credentials: true
  }));

  // JSON Body Parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Global API Rate Limiting
  app.use('/api', apiRateLimiter);

  // Healthcheck endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      service: 'ConnectHub AI Server API',
      version: '1.0.0'
    });
  });

  // API Router Base
  app.use('/api', routes);

  // Global Error Handler
  app.use(errorHandler);

  return app;
};
