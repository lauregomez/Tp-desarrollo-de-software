import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { canchaService } from './cancha.service';

export const canchaController = {

    async getAll(req: Request, res: Response): Promise<void> {
        const canchas = await canchaService.findAll();
        res.json(canchas);
    },

    async getById(req: Request, res: Response): Promise<void> {
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            res.status(400).json({ message: 'El id debe ser un número' });
            return;
        }

        const cancha = await canchaService.findById(id);
        if (!cancha) {
            res.status(404).json({ message: 'Cancha no encontrada' });
            return;
        }
        res.json(cancha);
    },

    async create(req: Request, res: Response): Promise<void> {
        const { nombre, capacidad, clubId } = req.body;

        if (typeof nombre !== 'string' || nombre.trim() === '') {
            res.status(400).json({ message: 'El campo nombre es obligatorio' });
            return;
        }

        try {
            const cancha = await canchaService.create({ nombre: nombre.trim(), capacidad, clubId });
            res.status(201).json(cancha);
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                res.status(409).json({ message: 'Ya existe una cancha con ese nombre' });
                return;
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
            await canchaService.remove(id);
            res.status(204).send();
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2025'
            ) {
                res.status(404).json({ message: 'Cancha no encontrada' });
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

        const { nombre, capacidad, clubId } = req.body;

        if (nombre !== undefined && (typeof nombre !== 'string' || nombre.trim() === '')) {
            res.status(400).json({ message: 'El campo nombre no puede estar vacío' });
            return;
        }

        try {
            const cancha = await canchaService.update(id, { nombre: nombre?.trim(), capacidad, clubId });
            res.json(cancha);
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2025'
            ) {
                res.status(404).json({ message: 'Cancha no encontrada' });
                return;
            }
            throw error;
        }
    },
}