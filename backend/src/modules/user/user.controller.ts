import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { userService } from './user.service';

export const userController = {
  async getAll(req: Request, res: Response): Promise<void> {
    const users = await userService.findAll();
    res.json(users);
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'El id debe ser un número' });
      return;
    }
    const user = await userService.findById(id);
    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    res.json(user);
  },

  async create(req: Request, res: Response): Promise<void> {
    const { name, lastName, email, password, roleId } = req.body;

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
    if (!Number.isInteger(roleId)) {
      res.status(400).json({ message: 'El rol es obligatorio' });
      return;
    }

    try {
      const user = await userService.create({
        name: name.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        roleId,
      });
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          res
            .status(409)
            .json({ message: 'Ya existe un usuario con ese email' });
          return;
        }
        if (error.code === 'P2003') {
          res.status(400).json({ message: 'El rol indicado no existe' });
          return;
        }
      }
      throw error;
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'El id debe ser un número' });
      return;
    }

    const { name, lastName, email, roleId } = req.body;

    if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
      res.status(400).json({ message: 'El campo nombre no puede estar vacío' });
      return;
    }
    if (
      lastName !== undefined &&
      (typeof lastName !== 'string' || lastName.trim() === '')
    ) {
      res
        .status(400)
        .json({ message: 'El campo apellido no puede estar vacío' });
      return;
    }
    if (email !== undefined && (typeof email !== 'string' || !email.includes('@'))) {
      res.status(400).json({ message: 'El email no es válido' });
      return;
    }
    if (roleId !== undefined && !Number.isInteger(roleId)) {
      res.status(400).json({ message: 'El rol no es válido' });
      return;
    }

    try {
      const user = await userService.update(id, {
        name: name?.trim(),
        lastName: lastName?.trim(),
        email: email?.trim().toLowerCase(),
        roleId,
      });
      res.json(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          res.status(404).json({ message: 'Usuario no encontrado' });
          return;
        }
        if (error.code === 'P2002') {
          res
            .status(409)
            .json({ message: 'Ya existe un usuario con ese email' });
          return;
        }
        if (error.code === 'P2003') {
          res.status(400).json({ message: 'El rol indicado no existe' });
          return;
        }
      }
      throw error;
    }
  },

  async remove(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'El id debe ser un número' });
      return;
    }
    try {
      await userService.remove(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          res.status(404).json({ message: 'Usuario no encontrado' });
          return;
        }
        if (error.code === 'P2003') {
          res.status(409).json({
            message: 'No se puede eliminar: el usuario tiene entradas asociadas',
          });
          return;
        }
      }
      throw error;
    }
  },
};