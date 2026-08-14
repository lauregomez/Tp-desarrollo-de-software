import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('[ERROR]', error);

  res.status(500).json({
    message: 'Ocurrió un error interno en el servidor',
  });
}