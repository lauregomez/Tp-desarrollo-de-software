import { Prisma, Club } from '@prisma/client';

export type { Club };
export type CreateClubDto = Prisma.ClubCreateInput;
export type UpdateClubDto = Prisma.ClubUpdateInput;