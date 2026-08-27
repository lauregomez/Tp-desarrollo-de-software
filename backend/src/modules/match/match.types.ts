import { Prisma, Match, MatchStatus, Category } from '@prisma/client';

export type { Match, MatchStatus, Category };

export type CreateMatchDto = Prisma.MatchUncheckedCreateInput;
export type UpdateMatchDto = Prisma.MatchUncheckedUpdateInput;


export type MatchFilters = {
  status?: MatchStatus;
  category?: Category;
  clubId?: number;
  from?: Date;
  to?: Date;
};
