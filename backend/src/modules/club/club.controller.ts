import { Request, Response } from 'express';
import { clubService } from './club.service';

export const clubController = {
  getAll(req: Request, res: Response): void {
    res.json(clubService.findAll());
  },

  getById(req: Request, res: Response): void {
    const club = clubService.findById(Number(req.params.id));
    if (!club) {
      res.status(404).json({ message: 'Club no encontrado' });
      return;
    }
    res.json(club);
  },

  create(req: Request, res: Response): void {
    const { nombre } = req.body;
    if (!nombre) {
      res.status(400).json({ message: 'El campo nombre es obligatorio' });
      return;
    }
    const club = clubService.create({ nombre });
    res.status(201).json(club);
  },

  update(req: Request, res: Response): void {
    const club = clubService.update(Number(req.params.id), req.body);
    if (!club) {
      res.status(404).json({ message: 'Club no encontrado' });
      return;
    }
    res.json(club);
  },

  remove(req: Request, res: Response): void {
    const ok = clubService.remove(Number(req.params.id));
    if (!ok) {
      res.status(404).json({ message: 'Club no encontrado' });
      return;
    }
    res.status(204).send();
  },
};