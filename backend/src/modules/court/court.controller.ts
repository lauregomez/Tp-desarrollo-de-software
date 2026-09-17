import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { courtService } from './court.service';

export const courtController = {

    async getAll(req: Request, res: Response): Promise<void> {
        const courts = await courtService.findAll();
        res.json(courts);
    },

    async getById(req: Request, res: Response): Promise<void> {
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            res.status(400).json({ message: 'El id debe ser un número' });
            return;
        }

        const court = await courtService.findById(id);
        if (!court) {
            res.status(404).json({ message: 'Cancha no encontrada' });
            return;
        }
        res.json(court);
    },

    async create(req: Request, res: Response): Promise<void> {
        const { name, address, capacity, clubId } = req.body;

        if (typeof name !== 'string' || name.trim() === '') {
            res.status(400).json({ message: 'El campo nombre es obligatorio' });
            return;
        }

         if (typeof address !== 'string' || address.trim() === '') {
           res.status(400).json({ message: 'El campo dirección es obligatorio' });
           return;
       }
                
        if (!Number.isInteger(capacity) || capacity <= 0) {
            res.status(400).json({ message: 'La capacidad debe ser un número entero positivo' });
            return;
        }

        if (!Number.isInteger(clubId) || clubId <= 0) {
            res.status(400).json({ message: 'El club indicado no es válido' });
            return;
        }

        try {
            const court = await courtService.create({
               name: name.trim(),
               address: address.trim(),
               capacity,
               clubId,
           });
            res.status(201).json(court);
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                res.status(409).json({ message: 'El club ya tiene una cancha con ese nombre' });
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
            await courtService.remove(id);
            res.status(204).send();
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
             if (error.code === 'P2025') {
                 res.status(404).json({ message: 'Cancha no encontrada' });
                 return;
             }
             // La FK de matches impide borrar una cancha con partidos.
             // Sin este caso lo atraparía el handler global con un mensaje
             // pensado para referencias inexistentes, que confunde al usuario.
             if (error.code === 'P2003') {
                 res.status(409).json({
                     message: 'No se puede eliminar la cancha porque tiene partidos asociados',
                 });
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

       const { name, address, capacity, clubId } = req.body;

        if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
            res.status(400).json({ message: 'El campo nombre no puede estar vacío' });
            return;
        }
        
        if (address !== undefined && (typeof address !== 'string' || address.trim() === '')) {
           res.status(400).json({ message: 'El campo dirección no puede estar vacío' });
           return;
       }

                if (capacity !== undefined && (!Number.isInteger(capacity) || capacity <= 0)) {
            res.status(400).json({ message: 'La capacidad debe ser un número entero positivo' });
            return;
        }

        if (clubId !== undefined && (!Number.isInteger(clubId) || clubId <= 0)) {
            res.status(400).json({ message: 'El club indicado no es válido' });
            return;
        }

        try {
            const court = await courtService.update(id, {
               name: name?.trim(),
               address: address?.trim(),
               capacity,
               clubId,
           });
            res.json(court);
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    res.status(404).json({ message: 'Cancha no encontrada' });
            return;
        }
        if (error.code === 'P2002') {
            res.status(409).json({ message: 'El club ya tiene una cancha con ese nombre' });
            return;
        }
    }
    throw error;
}
    },
}