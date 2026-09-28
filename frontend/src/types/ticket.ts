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
  // cancha. Se genera al confirmarse el pago: mientras la entrada
  // está PENDING todavía no existe, por eso puede ser null.
  code: string | null
  status: TicketStatus
  // Vencida = ACTIVE de un partido que ya terminó. No es un estado de la
  // base: lo calcula el backend (toOwnerTicket) para no depender del reloj
  // del navegador. Opcional por lo mismo que pricePaid: la vista de
  // operador no lo manda.
  expired?: boolean
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

// Titular de la entrada: los campos que el backend selecciona
// explícitamente en TICKET_INCLUDE. Nunca viaja el hash de la contraseña.
export interface TicketHolder {
  id: number
  name: string
  lastName: string
  email: string
}

// La entrada vista por el operador (toOperatorTicket en el backend):
// suma el titular para confirmar a nombre de quién está, y nunca trae
// el precio pagado. Omit en vez de repetir campos para que cualquier
// cambio en Ticket se herede acá.
export interface OperatorTicket extends Omit<Ticket, 'pricePaid' | 'expired'> {
  user: TicketHolder
}

// Respuesta exitosa de POST /api/tickets/validate. valid es literal true:
// ante 400/404/409 apiFetch lanza ApiError, así que por onSuccess nunca
// llega un false.
export interface ValidateTicketResponse {
  valid: true
  ticket: OperatorTicket
}

// Estado tal como se muestra: suma "Vencida", que no existe en la base.
export type TicketDisplayStatus = TicketStatus | 'EXPIRED'

// Etiquetas en español, igual que CATEGORY_LABEL y STATUS_LABEL de match.ts.
// Sin esto la pantalla mostraría el enum crudo (PENDING, ACTIVE, USED).
export const TICKET_STATUS_LABEL: Record<TicketDisplayStatus, string> = {
  PENDING: 'Pendiente de pago',
  ACTIVE: 'Activa',
  USED: 'Usada',
  EXPIRED: 'Vencida',
}

// El backend ya decidió si está vencida: acá sólo se elige qué mostrar.
export function ticketDisplayStatus(ticket: Ticket): TicketDisplayStatus {
  return ticket.expired ? 'EXPIRED' : ticket.status
}

// Opciones del filtro de "Mis entradas". EXPIRED viaja tal cual como
// ?status= y el backend lo traduce a "ACTIVE de un partido terminado".
// PENDING no está porque el backend responde 400.
export const MY_TICKET_FILTERS: TicketDisplayStatus[] = ['ACTIVE', 'EXPIRED', 'USED']