import { Prisma, Match, MatchStatus, Category } from '@prisma/client';

export type { Match, MatchStatus, Category };

export type CreateMatchDto = Prisma.MatchUncheckedCreateInput;
export type UpdateMatchDto = Prisma.MatchUncheckedUpdateInput;

export type MatchFilters = {
  statuses?: MatchStatus[];
  category?: Category;
  clubIds?: number[];
  courtIds?: number[];
  q?: string;
  from?: Date;
  to?: Date;
};

/**
 * Reglas de negocio centralizadas, como en ticket.types.ts.
 * Transiciones válidas de estado de un partido: un partido publicado no
 * vuelve a borrador (ya puede tener entradas vendidas) y FINISHED y
 * CANCELLED son estados finales.
 */
export const ALLOWED_TRANSITIONS: Record<MatchStatus, MatchStatus[]> = {
  DRAFT: [MatchStatus.PUBLISHED, MatchStatus.CANCELLED],
  PUBLISHED: [MatchStatus.FINISHED, MatchStatus.CANCELLED],
  FINISHED: [],
  CANCELLED: [],
};

export function isValidTransition(from: MatchStatus, to: MatchStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}