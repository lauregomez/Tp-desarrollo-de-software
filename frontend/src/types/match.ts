export type Category = 'PRIMERA' | 'RESERVA' | 'CUARTA' | 'QUINTA'

export type MatchStatus = 'DRAFT' | 'PUBLISHED' | 'FINISHED' | 'CANCELLED'

export interface ClubSummary {
  id: number
  name: string
}

export interface MatchClub extends ClubSummary {
  logoUrl: string | null
}

export interface CourtSummary {
  id: number
  name: string
}

export interface MatchCourt extends CourtSummary {
  address: string
}

export interface PublicMatch {
  id: number
  startsAt: string
  price: string
  category: Category
  homeClub: MatchClub
  awayClub: MatchClub
  court: MatchCourt
  status: MatchStatus
  soldOut: boolean
}

export const CATEGORY_LABEL: Record<Category, string> = {
  PRIMERA: 'Primera',
  RESERVA: 'Reserva',
  CUARTA: 'Cuarta',
  QUINTA: 'Quinta',
}

export interface AdminMatch {
  id: number
  startsAt: string
  price: string
  category: Category
  status: MatchStatus
  homeClubId: number | null
  awayClubId: number | null
  courtId: number | null
  homeClub: MatchClub | null
  awayClub: MatchClub | null
  court: MatchCourt | null
  capacity: number
  sold: number
  available: number
}

export interface CreateMatchDto {
  startsAt: string
  price: number
  category: Category
  homeClubId: number
  awayClubId: number
  courtId: number
  capacity?: number | null
}

export type UpdateMatchDto = Partial<CreateMatchDto>

export const STATUS_LABEL: Record<MatchStatus, string> = {
  DRAFT: 'Borrador',
  PUBLISHED: 'Publicado',
  FINISHED: 'Finalizado',
  CANCELLED: 'Cancelado',
}

export const ALLOWED_TRANSITIONS: Record<MatchStatus, MatchStatus[]> = {
  DRAFT: ['PUBLISHED', 'CANCELLED'],
  PUBLISHED: ['FINISHED', 'CANCELLED'],
  FINISHED: [],
  CANCELLED: [],
}

export const TRANSITION_LABEL: Record<MatchStatus, string> = {
  DRAFT: 'Volver a borrador',
  PUBLISHED: 'Publicar',
  FINISHED: 'Finalizar',
  CANCELLED: 'Cancelar',
}

export interface MatchFilterValues {
  statuses?: MatchStatus[]
  category?: Category
  clubIds?: number[]
  courtIds?: number[]
  q?: string
  from?: string
  to?: string
}