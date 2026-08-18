import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2003') {
      res.status(400).json({
        message: 'La referencia indicada no existe',
      });
      return;
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({
      message: 'Los datos enviados no tienen el formato esperado',
    });
    return;
  }

  console.error('[ERROR]', error);
  res.status(500).json({
    message: 'Ocurrió un error interno en el servidor',
  });
}