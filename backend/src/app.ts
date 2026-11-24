import cors from 'cors';
import express, { Express, Request, Response } from 'express';
import { env } from './config/env';
import { errorHandler } from './middleware/error.middleware';
import categoryRoutes from './routes/category.routes';
import dashboardRoutes from './routes/dashboard.routes';
import inventoryRoutes from './routes/inventory.routes';
import productRoutes from './routes/product.routes';

export const createApp = (): Express => {
  const app = express();

  // Middleware
  app.use(
    cors({
      origin: [env.FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use(express.json());

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // REST API Routes
  app.use('/api/categories', categoryRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: 'Resource not found',
      errors: ['Route does not exist'],
    });
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
};
