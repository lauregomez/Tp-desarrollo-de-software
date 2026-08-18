import { Prisma, Court } from '@prisma/client';

export type { Court };
export type CreateCourtDto = Prisma.CourtUncheckedCreateInput;
export type UpdateCourtDto = Prisma.CourtUncheckedUpdateInput;