import { Request, Response } from 'express';
import { Prisma, MatchStatus, Category } from '@prisma/client';
import {
  matchService,
  toPublicMatch,
  toAdminMatch,
  resolveCapacity,
} from './match.service';



const ALLOWED_TRANSITIONS: Record<MatchStatus, MatchStatus[]> = {
  DRAFT: [MatchStatus.PUBLISHED, MatchStatus.CANCELLED],
  PUBLISHED: [MatchStatus.FINISHED, MatchStatus.CANCELLED],
  FINISHED: [],
  CANCELLED: [],
};


function isAdmin(_req: Request): boolean {
  return false;
}

export const matchController = {
  async getAll(req: Request, res: Response): Promise<void> {
    const admin = isAdmin(req);
    const { status, category, clubId, from, to } = req.query;

    
    let statusFilter: MatchStatus | undefined = MatchStatus.PUBLISHED;

    if (admin) {
      statusFilter = undefined;
      if (typeof status === 'string' && status !== '') {
        if (!Object.values(MatchStatus).includes(status as MatchStatus)) {
          res.status(400).json({ message: 'El estado indicado no es válido' });
          return;
        }
        statusFilter = status as MatchStatus;
      }
    }

    let categoryFilter: Category | undefined;
    if (typeof category === 'string' && category !== '') {
      if (!Object.values(Category).includes(category as Category)) {
        res.status(400).json({ message: 'La categoría indicada no es válida' });
        return;
      }
      categoryFilter = category as Category;
    }

    let clubFilter: number | undefined;
    if (typeof clubId === 'string' && clubId !== '') {
      clubFilter = Number(clubId);
      if (!Number.isInteger(clubFilter) || clubFilter <= 0) {
        res.status(400).json({ message: 'El club indicado no es válido' });
        return;
      }
    }

    let fromFilter: Date | undefined;
    if (typeof from === 'string' && from !== '') {
      fromFilter = new Date(from);
      if (Number.isNaN(fromFilter.getTime())) {
        res.status(400).json({ message: 'La fecha desde no es válida' });
        return;
      }
    }

    let toFilter: Date | undefined;
    if (typeof to === 'string' && to !== '') {
      toFilter = new Date(to);
      if (Number.isNaN(toFilter.getTime())) {
        res.status(400).json({ message: 'La fecha hasta no es válida' });
        return;
      }
    }

    if (fromFilter && toFilter && fromFilter > toFilter) {
      res.status(400).json({ message: 'La fecha desde no puede ser posterior a la fecha hasta' });
      return;
    }

    const matches = await matchService.findAll({
      status: statusFilter,
      category: categoryFilter,
      clubId: clubFilter,
      from: fromFilter,
      to: toFilter,
    });

    res.json(matches.map((match) => (admin ? toAdminMatch(match) : toPublicMatch(match))));
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'El id debe ser un número' });
      return;
    }

    const match = await matchService.findById(id);

    if (!match) {
      res.status(404).json({ message: 'Partido no encontrado' });
      return;
    }

    
    if (!isAdmin(req) && match.status !== MatchStatus.PUBLISHED) {
      res.status(404).json({ message: 'Partido no encontrado' });
      return;
    }

    res.json(isAdmin(req) ? toAdminMatch(match) : toPublicMatch(match));
  },

  async create(req: Request, res: Response): Promise<void> {
    const { startsAt, price, category, capacity, homeClubId, awayClubId, courtId } = req.body;

    if (typeof startsAt !== 'string' || Number.isNaN(new Date(startsAt).getTime())) {
      res.status(400).json({ message: 'La fecha del partido no es válida' });
      return;
    }

    const date = new Date(startsAt);
    if (date.getTime() <= Date.now()) {
      res.status(400).json({ message: 'La fecha del partido debe ser futura' });
      return;
    }

    if (typeof price !== 'number' || price <= 0) {
      res.status(400).json({ message: 'El precio debe ser un número mayor a cero' });
      return;
    }

    if (typeof category !== 'string' || !Object.values(Category).includes(category as Category)) {
      res.status(400).json({ message: 'La categoría indicada no es válida' });
      return;
    }

    if (!Number.isInteger(homeClubId) || homeClubId <= 0) {
      res.status(400).json({ message: 'El club local indicado no es válido' });
      return;
    }

    if (!Number.isInteger(awayClubId) || awayClubId <= 0) {
      res.status(400).json({ message: 'El club visitante indicado no es válido' });
      return;
    }

    if (homeClubId === awayClubId) {
      res.status(400).json({ message: 'El club local y el visitante no pueden ser el mismo' });
      return;
    }

    if (!Number.isInteger(courtId) || courtId <= 0) {
      res.status(400).json({ message: 'La cancha indicada no es válida' });
      return;
    }

    
    if (capacity !== undefined && capacity !== null) {
      if (!Number.isInteger(capacity) || capacity <= 0) {
        res.status(400).json({ message: 'La capacidad debe ser un número entero positivo' });
        return;
      }

      const courtCapacity = await matchService.findCourtCapacity(courtId);
      if (courtCapacity === null) {
        res.status(404).json({ message: 'Cancha no encontrada' });
        return;
      }
      if (capacity > courtCapacity) {
        res.status(400).json({
          message: 'La capacidad del partido no puede superar la de la cancha',
        });
        return;
      }
    }

    const conflict = await matchService.findCourtConflict(courtId, date);
    if (conflict) {
      res.status(409).json({ message: 'Ya hay un partido programado en esa cancha en ese horario' });
      return;
    }

    const match = await matchService.create({
      startsAt: date,
      price,
      category: category as Category,
      capacity: capacity ?? null,
      homeClubId,
      awayClubId,
      courtId,
    });

    res.status(201).json(toAdminMatch(match));
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'El id debe ser un número' });
      return;
    }

    const current = await matchService.findById(id);

    if (!current) {
      res.status(404).json({ message: 'Partido no encontrado' });
      return;
    }

    if (current.status === MatchStatus.FINISHED || current.status === MatchStatus.CANCELLED) {
      res.status(409).json({ message: 'No se puede editar un partido finalizado o cancelado' });
      return;
    }

    const { startsAt, price, category, capacity, homeClubId, awayClubId, courtId } = req.body;
    const hasTickets = current._count.tickets > 0;

    
    if (hasTickets && (price !== undefined || courtId !== undefined)) {
      res.status(409).json({
        message: 'No se puede cambiar el precio ni la cancha de un partido con entradas vendidas',
      });
      return;
    }

    let date: Date | undefined;
    if (startsAt !== undefined) {
      if (typeof startsAt !== 'string' || Number.isNaN(new Date(startsAt).getTime())) {
        res.status(400).json({ message: 'La fecha del partido no es válida' });
        return;
      }
      date = new Date(startsAt);
      if (date.getTime() <= Date.now()) {
        res.status(400).json({ message: 'La fecha del partido debe ser futura' });
        return;
      }
    }

    if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
      res.status(400).json({ message: 'El precio debe ser un número mayor a cero' });
      return;
    }

    if (
      category !== undefined &&
      (typeof category !== 'string' || !Object.values(Category).includes(category as Category))
    ) {
      res.status(400).json({ message: 'La categoría indicada no es válida' });
      return;
    }

    if (homeClubId !== undefined && (!Number.isInteger(homeClubId) || homeClubId <= 0)) {
      res.status(400).json({ message: 'El club local indicado no es válido' });
      return;
    }

    if (awayClubId !== undefined && (!Number.isInteger(awayClubId) || awayClubId <= 0)) {
      res.status(400).json({ message: 'El club visitante indicado no es válido' });
      return;
    }

    const finalHomeClubId = homeClubId ?? current.homeClubId;
    const finalAwayClubId = awayClubId ?? current.awayClubId;

    if (finalHomeClubId === finalAwayClubId) {
      res.status(400).json({ message: 'El club local y el visitante no pueden ser el mismo' });
      return;
    }

    if (courtId !== undefined && (!Number.isInteger(courtId) || courtId <= 0)) {
      res.status(400).json({ message: 'La cancha indicada no es válida' });
      return;
    }

    const finalCourtId = courtId ?? current.courtId;

    if (capacity !== undefined && capacity !== null) {
      if (!Number.isInteger(capacity) || capacity <= 0) {
        res.status(400).json({ message: 'La capacidad debe ser un número entero positivo' });
        return;
      }

      const courtCapacity = await matchService.findCourtCapacity(finalCourtId);
      if (courtCapacity === null) {
        res.status(404).json({ message: 'Cancha no encontrada' });
        return;
      }
      if (capacity > courtCapacity) {
        res.status(400).json({
          message: 'La capacidad del partido no puede superar la de la cancha',
        });
        return;
      }
    }

    if (date !== undefined || courtId !== undefined) {
      const conflict = await matchService.findCourtConflict(
        finalCourtId,
        date ?? current.startsAt,
        id,
      );
      if (conflict) {
        res.status(409).json({
          message: 'Ya hay un partido programado en esa cancha en ese horario',
        });
        return;
      }
    }

    try {
      const match = await matchService.update(id, {
        ...(date !== undefined && { startsAt: date }),
        ...(price !== undefined && { price }),
        ...(category !== undefined && { category: category as Category }),
        ...(capacity !== undefined && { capacity }),
        ...(homeClubId !== undefined && { homeClubId }),
        ...(awayClubId !== undefined && { awayClubId }),
        ...(courtId !== undefined && { courtId }),
      });

      res.json(toAdminMatch(match));
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        res.status(404).json({ message: 'Partido no encontrado' });
        return;
      }
      throw error;
    }
  },

  
  async changeStatus(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'El id debe ser un número' });
      return;
    }

    const { status } = req.body;

    if (typeof status !== 'string' || !Object.values(MatchStatus).includes(status as MatchStatus)) {
      res.status(400).json({ message: 'El estado indicado no es válido' });
      return;
    }

    const match = await matchService.findById(id);

    if (!match) {
      res.status(404).json({ message: 'Partido no encontrado' });
      return;
    }

    if (!ALLOWED_TRANSITIONS[match.status].includes(status as MatchStatus)) {
      res.status(409).json({
        message: `No se puede pasar un partido de ${match.status} a ${status}`,
      });
      return;
    }

    const updated = await matchService.update(id, { status: status as MatchStatus });
    res.json(toAdminMatch(updated));
  },

  async remove(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'El id debe ser un número' });
      return;
    }

    const match = await matchService.findById(id);

    if (!match) {
      res.status(404).json({ message: 'Partido no encontrado' });
      return;
    }

    
    if (match.status !== MatchStatus.DRAFT) {
      res.status(409).json({
        message: 'Sólo se pueden eliminar partidos en estado borrador',
      });
      return;
    }

    if (match._count.tickets > 0) {
      res.status(409).json({ message: 'El partido tiene entradas asociadas' });
      return;
    }

    try {
      await matchService.remove(id);
      res.status(204).send();
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        res.status(404).json({ message: 'Partido no encontrado' });
        return;
      }
      throw error;
    }
  },
};
