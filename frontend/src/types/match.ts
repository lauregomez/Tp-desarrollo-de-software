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

// Proyección que devuelve el backend cuando quien pregunta es ADMIN.
// A diferencia de PublicMatch expone la capacidad real y las entradas
// vendidas, y no trae soldOut (el admin ve los números, no el booleano).
export interface AdminMatch {
  id: number
  startsAt: string
  price: string
  category: Category
  status: MatchStatus
  homeClubId: number
  awayClubId: number
  courtId: number
  homeClub: ClubSummary
  awayClub: ClubSummary
  court: CourtSummary
  capacity: number
  sold: number
  available: number
}

// Cuerpo del POST /api/matches.
// price va como number aunque el backend lo devuelva como string:
// Prisma serializa el Decimal a string al responder, pero valida
// typeof price === 'number' al recibir.
// capacity es opcional: si no se manda, el partido usa la de la cancha.
export interface CreateMatchDto {
  startsAt: string
  price: number
  category: Category
  homeClubId: number
  awayClubId: number
  courtId: number
  capacity?: number | null
}

// El PUT acepta cambios parciales: sólo se mandan los campos tocados.
export type UpdateMatchDto = Partial<CreateMatchDto>