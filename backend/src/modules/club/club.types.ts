import { Club } from '@prisma/client';

export type { Club };

export type CreateClubDto = {
  name: string;
  logoUrl?: string | null;
  description?: string | null;
  foundedYear?: number | null;
};

export type UpdateClubDto = Partial<CreateClubDto>;
