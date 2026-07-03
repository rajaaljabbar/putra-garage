import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Always log full error server-side, never expose stack to client in production
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}:`, err.message);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal Server Error' : err.message;

  res.status(statusCode).json({
    success: false,
    message,
    // Only include details in non-production environments
    ...(process.env.NODE_ENV !== 'production' && { detail: err.message, stack: err.stack }),
  });
};
