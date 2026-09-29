import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';

export interface JwtPayload {
  userId: number;
  role: string;
}

export const authService = {
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      include: { role: true },
    });

    if (!user) return { ok: false as const, reason: 'INVALID' as const };

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return { ok: false as const, reason: 'INVALID' as const };

    // Un usuario dado de baja no puede ingresar, aunque sus credenciales
    // sigan siendo correctas.
    if (!user.isActive) {
      return { ok: false as const, reason: 'INACTIVE' as const };
    }

    const payload: JwtPayload = {
      userId: user.id,
      role: user.role.name,
    };

    const token = jwt.sign(payload, env.jwtSecret, {
      expiresIn: env.jwtExpiresIn ?? '1d',
    } as jwt.SignOptions);

    return {
      ok: true as const,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          lastName: user.lastName,
          email: user.email,
          role: user.role.name,
        },
      },
    };
  },
};
