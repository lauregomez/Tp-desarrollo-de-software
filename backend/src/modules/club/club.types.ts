import { Club } from '@prisma/client';

export type { Club };

// Contrato de entrada de la API, no de Prisma: no expone relaciones ni
// operadores como { set: ... }. El `| null` permite borrar un campo opcional,
// que Prisma distingue de `undefined` (no modificar la columna).
export type CreateClubDto = {
  name: string;
  logoUrl?: string | null;
  description?: string | null;
  foundedYear?: number | null;
};

export type UpdateClubDto = Partial<CreateClubDto>;
