import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { clubService } from './club.service';

const MAX_LOGO_URL_LENGTH = 500; // igual que el VARCHAR(500) de la columna
const MAX_DESCRIPTION_LENGTH = 1000;
const MIN_FOUNDED_YEAR = 1850; // hay clubes de Rosario fundados en el siglo XIX

type OptionalClubFields = {
  logoUrl?: string | null;
  description?: string | null;
  foundedYear?: number | null;
};

type ParseResult<T> = { error: string } | { value: T };

// Un texto opcional vacío se guarda como null: así "sin descripción" se
// representa de una sola forma en la base.
const parseOptionalText = (
  value: unknown,
  label: string,
  maxLength: number,
): ParseResult<string | null> => {
  if (value === null) return { value: null };
  if (typeof value !== 'string') return { error: `${label} debe ser un texto` };

  const trimmed = value.trim();
  if (trimmed === '') return { value: null };
  if (trimmed.length > maxLength) {
    return { error: `${label} no puede superar los ${maxLength} caracteres` };
  }
  return { value: trimmed };
};

// El parser nativo acepta cualquier esquema, así que además exigimos http(s):
// una URL como "javascript:..." es válida para new URL() y terminaría en el src
// de una imagen del frontend.
const isHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

// El middleware ya descartó los undefined, así que que la clave esté presente
// significa que el cliente mandó el campo: con null pide borrarlo.
const parseOptionalClubFields = (
  input: Record<string, unknown>,
): { error: string } | { data: OptionalClubFields } => {
  const data: OptionalClubFields = {};

  if ('logoUrl' in input) {
    const parsed = parseOptionalText(
      input.logoUrl,
      'La URL del logo',
      MAX_LOGO_URL_LENGTH,
    );
    if ('error' in parsed) return { error: parsed.error };
    if (parsed.value !== null && !isHttpUrl(parsed.value)) {
      return { error: 'La URL del logo debe empezar con http:// o https://' };
    }
    data.logoUrl = parsed.value;
  }

  if ('description' in input) {
    const parsed = parseOptionalText(
      input.description,
      'La descripción',
      MAX_DESCRIPTION_LENGTH,
    );
    if ('error' in parsed) return { error: parsed.error };
    data.description = parsed.value;
  }

  if ('foundedYear' in input) {
    const value = input.foundedYear;
    const currentYear = new Date().getFullYear();

    if (value === null) {
      data.foundedYear = null;
    } else if (typeof value !== 'number' || !Number.isInteger(value)) {
      return { error: 'El año de fundación debe ser un número entero' };
    } else if (value < MIN_FOUNDED_YEAR || value > currentYear) {
      return {
        error: `El año de fundación debe estar entre ${MIN_FOUNDED_YEAR} y ${currentYear}`,
      };
    } else {
      data.foundedYear = value;
    }
  }

  return { data };
};

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
    const { name } = req.body.sanitizedClubInput;
    if (typeof name !== 'string' || name.trim() === '') {
      res.status(400).json({ message: 'El campo nombre es obligatorio' });
      return;
    }

    const parsed = parseOptionalClubFields(req.body.sanitizedClubInput);
    if ('error' in parsed) {
      res.status(400).json({ message: parsed.error });
      return;
    }

    try {
      const club = await clubService.create({
        name: name.trim(),
        ...parsed.data,
      });
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
    const { name } = req.body.sanitizedClubInput;
    if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
      res.status(400).json({ message: 'El campo nombre no puede estar vacío' });
      return;
    }

    const parsed = parseOptionalClubFields(req.body.sanitizedClubInput);
    if ('error' in parsed) {
      res.status(400).json({ message: parsed.error });
      return;
    }

    try {
      const club = await clubService.update(id, {
        name: name?.trim(),
        ...parsed.data,
      });
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
    const result = await clubService.remove(id);

    if (result === 'NOT_FOUND') {
      res.status(404).json({ message: 'Club no encontrado' });
      return;
    }
    if (result === 'HAS_PUBLISHED_MATCHES') {
      res.status(409).json({
        message:
          'No se puede eliminar el club porque tiene partidos publicados, como local, visitante o en alguna de sus canchas',
      });
      return;
    }
    res.status(204).send();
  },
};