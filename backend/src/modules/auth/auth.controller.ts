import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { authService } from './auth.service';
import { userService } from '../user/user.service';
import { prisma } from '../../config/prisma';

export const authController = {
  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string') {
      res.status(400).json({ message: 'Email y contraseña son obligatorios' });
      return;
    }

    const result = await authService.login(email, password);

    if (!result) {
      res.status(401).json({ message: 'Email o contraseña incorrectos' });
      return;
    }

    res.json(result);
  },

  async register(req: Request, res: Response): Promise<void> {
    const { name, lastName, email, password } = req.body;

    if (typeof name !== 'string' || name.trim() === '') {
      res.status(400).json({ message: 'El campo nombre es obligatorio' });
      return;
    }
    if (typeof lastName !== 'string' || lastName.trim() === '') {
      res.status(400).json({ message: 'El campo apellido es obligatorio' });
      return;
    }
    if (typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ message: 'El email no es válido' });
      return;
    }
    if (typeof password !== 'string' || password.length < 8) {
      res
        .status(400)
        .json({ message: 'La contraseña debe tener al menos 8 caracteres' });
      return;
    }

    const defaultRole = await prisma.role.findUnique({
      where: { name: 'USER' },
    });

    if (!defaultRole) {
      res
        .status(500)
        .json({ message: 'El rol por defecto no está configurado' });
      return;
    }

    try {
      const user = await userService.create({
        name: name.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        roleId: defaultRole.id,
      });
      res.status(201).json(user);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        res.status(409).json({ message: 'Ya existe un usuario con ese email' });
        return;
      }
      throw error;
    }
  },
};