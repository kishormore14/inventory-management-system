import { NextFunction, Request, Response } from 'express';
import { ApiResponse } from '../types';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response<ApiResponse>,
  _next: NextFunction
) => {
  console.error('Unhandled Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const errors = err.errors || [];

  res.status(statusCode).json({
    success: false,
    message,
    errors: errors.length > 0 ? errors : [message],
  });
};
