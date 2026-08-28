import { Request } from 'express';

export interface AuthUser {
  userId: number;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}