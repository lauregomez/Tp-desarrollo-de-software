import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { clubService } from './club.service';

export const clubController = {
  async getAll(req: Request, res: Response): Promise<void> {
    const clubs = await clubService.findAll();
    res.json(clubs);
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'El id debe ser un número' });
      return;
    }
    const club = await clubService.findById(id);
    if (!club) {
      res.status(404).json({ message: 'Club no encontrado' });
      return;
    }
    res.json(club);
  },

  async create(req: Request, res: Response): Promise<void> {
    const { name } = req.body;
    if (typeof name !== 'string' || name.trim() === '') {
      res.status(400).json({ message: 'El campo nombre es obligatorio' });
      return;
    }
    try {
      const club = await clubService.create({ name: name.trim() });
      res.status(201).json(club);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        res.status(409).json({ message: 'Ya existe un club con ese nombre' });
        return;
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
    const { name } = req.body;
    if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
      res.status(400).json({ message: 'El campo nombre no puede estar vacío' });
      return;
    }
    try {
      const club = await clubService.update(id, { name: name?.trim() });
      res.json(club);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          res.status(404).json({ message: 'Club no encontrado' });
          return;
        }
        if (error.code === 'P2002') {
          res.status(409).json({ message: 'Ya existe un club con ese nombre' });
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
      await clubService.remove(id);
      res.status(204).send();
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        res.status(404).json({ message: 'Club no encontrado' });
        return;
      }
      throw error;
    }
  },
};