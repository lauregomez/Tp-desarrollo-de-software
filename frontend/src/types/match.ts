export type Category = 'PRIMERA' | 'RESERVA' | 'CUARTA' | 'QUINTA'

export type MatchStatus = 'DRAFT' | 'PUBLISHED' | 'FINISHED' | 'CANCELLED'

export interface ClubSummary {
  id: number
  name: string
}

export interface CourtSummary {
  id: number
  name: string
}

export interface PublicMatch {
  id: number
  startsAt: string
  price: string
  category: Category
  homeClub: ClubSummary
  awayClub: ClubSummary
  court: CourtSummary
  status: MatchStatus
  soldOut: boolean
}

export const CATEGORY_LABEL: Record<Category, string> = {
  PRIMERA: 'Primera',
  RESERVA: 'Reserva',
  CUARTA: 'Cuarta',
  QUINTA: 'Quinta',
}