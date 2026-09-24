import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { courtService } from './court.service';

// Los dos campos son String sin @db.VarChar en el schema, así que Prisma usa
// VARCHAR(191). Validar acá evita que MySQL rechace el insert y termine en un
// 500 (P2000) en lugar de un 400 con un mensaje claro.
const MAX_NAME_LENGTH = 191;
const MAX_ADDRESS_LENGTH = 191;
// Una dirección real tiene al menos calle y número: "a" no identifica nada.
const MIN_ADDRESS_LENGTH = 5;

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
        // sanitizeCourtInput ya dejó sólo los campos permitidos.
        const { name, address, capacity, clubId } = req.body.sanitizedCourtInput;

        if (typeof name !== 'string' || name.trim() === '') {
            res.status(400).json({ message: 'El campo nombre es obligatorio' });
            return;
        }

        if (name.trim().length > MAX_NAME_LENGTH) {
            res.status(400).json({
                message: `El nombre no puede superar los ${MAX_NAME_LENGTH} caracteres`,
            });
            return;
        }

        if (typeof address !== 'string' || address.trim() === '') {
            res.status(400).json({ message: 'El campo dirección es obligatorio' });
            return;
        }

        if (
            address.trim().length < MIN_ADDRESS_LENGTH ||
            address.trim().length > MAX_ADDRESS_LENGTH
        ) {
            res.status(400).json({
                message: `La dirección debe tener entre ${MIN_ADDRESS_LENGTH} y ${MAX_ADDRESS_LENGTH} caracteres`,
            });
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

        // En el PUT todos los campos son opcionales: sólo se valida lo que vino.
        const { name, address, capacity, clubId } = req.body.sanitizedCourtInput;

        if (name !== undefined) {
            if (typeof name !== 'string' || name.trim() === '') {
                res.status(400).json({ message: 'El campo nombre no puede estar vacío' });
                return;
            }
            if (name.trim().length > MAX_NAME_LENGTH) {
                res.status(400).json({
                    message: `El nombre no puede superar los ${MAX_NAME_LENGTH} caracteres`,
                });
                return;
            }
        }

        if (address !== undefined) {
            if (typeof address !== 'string' || address.trim() === '') {
                res.status(400).json({ message: 'El campo dirección no puede estar vacío' });
                return;
            }
            if (
                address.trim().length < MIN_ADDRESS_LENGTH ||
                address.trim().length > MAX_ADDRESS_LENGTH
            ) {
                res.status(400).json({
                    message: `La dirección debe tener entre ${MIN_ADDRESS_LENGTH} y ${MAX_ADDRESS_LENGTH} caracteres`,
                });
                return;
            }
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
};