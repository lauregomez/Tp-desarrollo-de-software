export type Category = 'PRIMERA' | 'RESERVA' | 'CUARTA' | 'QUINTA'

export type MatchStatus = 'DRAFT' | 'PUBLISHED' | 'FINISHED' | 'CANCELLED'

export interface ClubSummary {
  id: number
  name: string
}

// El club tal como viene dentro de un partido: matchInclude del backend
// también trae el escudo. Va aparte de ClubSummary porque TicketMatch usa
// ClubSummary y las entradas no traen logoUrl.
// null: el escudo es opcional al crear un club.
export interface MatchClub extends ClubSummary {
  logoUrl: string | null
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
  homeClub: MatchClub
  awayClub: MatchClub
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
  homeClubId: number | null
  awayClubId: number | null
  courtId: number | null
  homeClub: MatchClub | null
  awayClub: MatchClub | null
  court: CourtSummary | null
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

// Etiquetas en español para mostrar el estado, igual que CATEGORY_LABEL.
// Sin esto la tabla muestra el enum crudo del backend (DRAFT, PUBLISHED).
export const STATUS_LABEL: Record<MatchStatus, string> = {
  DRAFT: 'Borrador',
  PUBLISHED: 'Publicado',
  FINISHED: 'Finalizado',
  CANCELLED: 'Cancelado',
}

// Espejo de ALLOWED_TRANSITIONS del backend (match.controller.ts).
// Se duplica acá para no ofrecer acciones que el servidor va a rechazar:
// la regla sigue viviendo en el backend, esto sólo evita el 409.
export const ALLOWED_TRANSITIONS: Record<MatchStatus, MatchStatus[]> = {
  DRAFT: ['PUBLISHED', 'CANCELLED'],
  PUBLISHED: ['FINISHED', 'CANCELLED'],
  FINISHED: [],
  CANCELLED: [],
}

// Texto del botón que dispara cada transición.
export const TRANSITION_LABEL: Record<MatchStatus, string> = {
  DRAFT: 'Volver a borrador',
  PUBLISHED: 'Publicar',
  FINISHED: 'Finalizar',
  CANCELLED: 'Cancelar',
}

// Filtros de GET /api/matches. Todos opcionales y acumulables:
// el que queda undefined no se manda y el backend no filtra por él.
// Filtros de GET /api/matches. Todos opcionales y acumulables.
// Los que son listas admiten varias opciones a la vez: dentro de una
// lista es un "o", y entre filtros distintos es un "y".
export interface MatchFilterValues {
  statuses?: MatchStatus[]
  category?: Category
  clubIds?: number[]
  courtIds?: number[]
  q?: string
}