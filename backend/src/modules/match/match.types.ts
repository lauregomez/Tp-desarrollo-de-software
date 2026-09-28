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

// Duración de un partido de fútsal. Define hasta cuándo se venden entradas
// (se sigue vendiendo durante el partido para los que llegan tarde) y el
// margen para que dos partidos no se pisen en la misma cancha.
export const MATCH_DURATION_MINUTES = 50;

// Momento en que termina un partido. Hasta ese momento se venden entradas;
// después, las entradas activas que no se usaron quedan vencidas.
export function matchEndsAt(startsAt: Date): Date {
  return new Date(startsAt.getTime() + MATCH_DURATION_MINUTES * 60 * 1000);
}

// Los partidos que empezaron antes de este momento ya terminaron.
// Es la versión de matchEndsAt que sirve para consultas: endsAt no es una
// columna, así que se compara contra startsAt.
export function endedMatchCutoff(): Date {
  return new Date(Date.now() - MATCH_DURATION_MINUTES * 60 * 1000);
}

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