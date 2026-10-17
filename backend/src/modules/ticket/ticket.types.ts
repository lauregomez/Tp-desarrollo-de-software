import { Prisma, Ticket, TicketStatus } from '@prisma/client';
export const SOLD_STATUSES: TicketStatus[] = [TicketStatus.ACTIVE, TicketStatus.USED];


export type { Ticket, TicketStatus };

export type CreateTicketDto = Prisma.TicketUncheckedCreateInput;
export type UpdateTicketDto = Prisma.TicketUncheckedUpdateInput;

export const MAX_TICKETS_PER_USER_PER_MATCH = 5;

export type ReserveTicketDto = {
  userId: number;
  matchId: number;
  quantity: number;
};

export type TicketFilters = {
  userId?: number;
  matchId?: number;
  status?: TicketStatus | TicketStatus[];
  matchEnded?: boolean;
};

export type ReserveFailureReason =
  | 'MATCH_NOT_FOUND'
  | 'MATCH_NOT_PUBLISHED'
  | 'MATCH_ALREADY_FINISHED'
  | 'USER_LIMIT_EXCEEDED'
  | 'NOT_ENOUGH_CAPACITY';

export type ValidateFailureReason =
  | 'TICKET_NOT_FOUND'
  | 'TICKET_ALREADY_USED'
  | 'TICKET_NOT_PAID'
  | 'MATCH_NOT_PUBLISHED';

export type ServiceResult<T, R> =
  | { ok: true; data: T }
  | { ok: false; reason: R };
