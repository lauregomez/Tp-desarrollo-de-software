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

export const MATCH_DURATION_MINUTES = 50;

export function matchEndsAt(startsAt: Date): Date {
  return new Date(startsAt.getTime() + MATCH_DURATION_MINUTES * 60 * 1000);
}

export function endedMatchCutoff(): Date {
  return new Date(Date.now() - MATCH_DURATION_MINUTES * 60 * 1000);
}

export const ALLOWED_TRANSITIONS: Record<MatchStatus, MatchStatus[]> = {
  DRAFT: [MatchStatus.PUBLISHED, MatchStatus.CANCELLED],
  PUBLISHED: [MatchStatus.FINISHED, MatchStatus.CANCELLED],
  FINISHED: [],
  CANCELLED: [],
};

export function isValidTransition(from: MatchStatus, to: MatchStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}