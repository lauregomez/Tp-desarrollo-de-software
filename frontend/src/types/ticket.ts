import type {
  Category,
  ClubSummary,
  MatchStatus,
} from './match'

// Estados posibles de una entrada, espejo del enum TicketStatus del backend.
export type TicketStatus = 'PENDING' | 'ACTIVE' | 'USED'


// La cancha tal como viene dentro de una entrada. No reutiliza
// CourtSummary de match.ts porque esa proyección no trae address:
// compartir el tipo haría que match.ts declare un campo que su API
// no devuelve. address es String en el schema, nunca null.
export interface TicketCourt {
  id: number
  name: string
  address: string
}


// El partido que viaja anidado dentro de la entrada. No es PublicMatch:
// esta proyección no trae soldOut y sí trae el estado del partido.
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

// Una entrada del usuario logueado (GET /api/tickets/me y /api/tickets/:id).
// No trae el objeto user anidado (nombre, email): el backend lo saca con
// toOwnerTicket porque son siempre las entradas de quien pregunta. El
// userId sí viaja, como cualquier otra clave foránea.
export interface Ticket {
  id: number
    // Código alfanumérico que el asistente le dicta al operador en la
  // cancha. Se genera al confirmarse el pago: mientras la entrada está
  // PENDING todavía no existe, por eso puede ser null.
  // está PENDING todavía no existe, por eso puede ser null.
  code: string | null
  status: TicketStatus
  // Decimal de Prisma: viaja como string para no perder precisión.
  // Opcional porque el backend usa dos proyecciones: el dueño recibe el
  // precio, y un ADMIN u OPERATOR que mira una entrada ajena no (los
  // datos de pago no le competen). Ver toOperatorTicket en el backend.
  pricePaid?: string
  createdAt: string
  matchId: number
  userId: number
  match: TicketMatch
}

// Etiquetas en español, igual que CATEGORY_LABEL y STATUS_LABEL de match.ts.
// Sin esto la pantalla mostraría el enum crudo (PENDING, ACTIVE, USED).
export const TICKET_STATUS_LABEL: Record<TicketStatus, string> = {
  PENDING: 'Pendiente de pago',
  ACTIVE: 'Activa',
  USED: 'Usada',
}

// Estados que el usuario puede ver en "Mis entradas": sólo las pagas.
// Espejo de SOLD_STATUSES del backend, que rechaza con 400 cualquier
// otro estado en GET /api/tickets/me.
export const SOLD_STATUSES: TicketStatus[] = ['ACTIVE', 'USED']