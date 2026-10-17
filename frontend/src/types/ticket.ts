import type {
  Category,
  ClubSummary,
  MatchStatus,
} from './match'

export type TicketStatus = 'PENDING' | 'ACTIVE' | 'USED'

export interface TicketCourt {
  id: number
  name: string
  address: string
}

export interface TicketMatch {
  id: number
  startsAt: string
  price: string
  category: Category
  status: MatchStatus
  homeClub: ClubSummary | null
  awayClub: ClubSummary | null
  court: TicketCourt | null
}

export interface Ticket {
  id: number
  code: string | null
  status: TicketStatus
  expired?: boolean
  pricePaid?: string
  createdAt: string
  matchId: number
  userId: number
  match: TicketMatch
}

export interface TicketHolder {
  id: number
  name: string
  lastName: string
  email: string
}

export interface OperatorTicket extends Omit<Ticket, 'pricePaid' | 'expired'> {
  user: TicketHolder
}

export interface ValidateTicketResponse {
  valid: true
  ticket: OperatorTicket
}

export type TicketDisplayStatus = TicketStatus | 'EXPIRED'

export const TICKET_STATUS_LABEL: Record<TicketDisplayStatus, string> = {
  PENDING: 'Pendiente de pago',
  ACTIVE: 'Activa',
  USED: 'Usada',
  EXPIRED: 'Vencida',
}

export function ticketDisplayStatus(ticket: Ticket): TicketDisplayStatus {
  return ticket.expired ? 'EXPIRED' : ticket.status
}

export const MY_TICKET_FILTERS: TicketDisplayStatus[] = ['ACTIVE', 'EXPIRED', 'USED']