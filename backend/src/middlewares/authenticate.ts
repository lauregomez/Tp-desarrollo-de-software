import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, AuthUser } from './auth.types';

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token no proporcionado' });
    return;
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as AuthUser;

    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
}