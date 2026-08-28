import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, AuthUser } from './auth.types';

export function optionalAuthenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    next();
    return;
  }

  try {
    const payload = jwt.verify(
      header.slice(7),
      process.env.JWT_SECRET as string,
    ) as AuthUser;
    req.user = payload;
  } catch {
    // Token inválido: se ignora y el request sigue como anónimo.
  }

  next();
}