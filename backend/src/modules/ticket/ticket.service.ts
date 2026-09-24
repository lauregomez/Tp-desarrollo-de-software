import { randomInt } from 'node:crypto';
import { prisma } from '../../config/prisma';
import { MatchStatus, TicketStatus, Prisma } from '@prisma/client';
import {
  CreateTicketDto,
  UpdateTicketDto,
  ReserveTicketDto,
  TicketFilters,
  ReserveFailureReason,
  ServiceResult,
  MAX_TICKETS_PER_USER_PER_MATCH,
  SOLD_STATUSES,
} from './ticket.types';

/**
 * Relaciones que se traen siempre junto al ticket.
 * El usuario se incluye porque el operador necesita ver a nombre de quién
 * está la entrada al validar en la puerta.
 *
 * `satisfies` valida la forma del objeto contra Prisma.TicketInclude pero
 * conserva el tipo literal, que es lo que permite derivar
 * TicketWithRelations más abajo sin escribirlo a mano.
 */
const TICKET_INCLUDE = {
  match: {
    include: {
      homeClub: { select: { id: true, name: true } },
      awayClub: { select: { id: true, name: true } },
      court: { select: { id: true, name: true } },
    },
  },
  user: { select: { id: true, name: true, lastName: true, email: true } },
} satisfies Prisma.TicketInclude;

/**
 * Tipo del ticket con todas sus relaciones.
 * Se deriva del include en vez de usar ReturnType<typeof ticketService.findById>
 * porque eso último genera una referencia circular (el objeto se referiría
 * a sí mismo durante su propia definición) y TypeScript lo rechaza.
 */
export type TicketWithRelations = Prisma.TicketGetPayload<{
  include: typeof TICKET_INCLUDE;
}>;


const CODE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const CODE_LENGTH = 4;
const MAX_CODE_ATTEMPTS = 5;

// randomInt usa el generador criptográfico del sistema. Math.random no sirve:
// es predecible, y con suficientes muestras se podrían adivinar códigos válidos.
function generateCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  }
  return code;
}

// El código sólo tiene que ser único dentro del partido: el operador valida
// siempre en el contexto del partido que está atendiendo. Con tantas
// combinaciones, una colisión es casi imposible; el límite de intentos es
// para no tener un bucle infinito teórico.
async function generateUniqueCode(
  tx: Prisma.TransactionClient,
  matchId: number,
): Promise<string> {
  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
    const code = generateCode();
    const taken = await tx.ticket.findFirst({
      where: { matchId, code },
      select: { id: true },
    });
    if (!taken) return code;
  }
  throw new Error('No se pudo generar un código único para la entrada');
}

export const ticketService = {
  async findAll(filters: TicketFilters = {}): Promise<TicketWithRelations[]> {
    return prisma.ticket.findMany({
      where: {
        userId: filters.userId,
        matchId: filters.matchId,
        status: Array.isArray(filters.status)
          ? { in: filters.status }
          : filters.status,
      },
      include: TICKET_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(id: number): Promise<TicketWithRelations | null> {
    return prisma.ticket.findUnique({
      where: { id },
      include: TICKET_INCLUDE,
    });
  },

  /**
   * Busca una entrada por su código dentro de un partido.
   * El código sólo es único dentro del partido, así que se necesitan los dos.
   */
  async findByCode(
    matchId: number,
    code: string,
  ): Promise<TicketWithRelations | null> {
    return prisma.ticket.findUnique({
      where: { matchId_code: { matchId, code } },
      include: TICKET_INCLUDE,
    });
  },

    /**
   * Reserva N entradas en estado PENDING: representan el intento de compra
   * que después se asocia a la orden de MercadoPago.
   *
   * Las validaciones de cupo y de límite por usuario son preliminares:
   * evitan iniciar un pago que ya se sabe que no va a entrar. La validación
   * definitiva se repite al confirmar el pago, porque recién ahí la entrada
   * pasa a ocupar lugar.
   */
  async reserve(
    dto: ReserveTicketDto,
  ): Promise<ServiceResult<TicketWithRelations[], ReserveFailureReason>> {
    return prisma.$transaction(async (tx) => {
      // 1. Traer el partido junto con la capacidad de la cancha.
      const match = await tx.match.findUnique({
        where: { id: dto.matchId },
        include: { court: { select: { capacity: true } } },
      });

      if (!match) {
        return { ok: false as const, reason: 'MATCH_NOT_FOUND' as const };
      }

      // Sólo se venden entradas de partidos publicados.
      if (match.status !== MatchStatus.PUBLISHED) {
        return { ok: false as const, reason: 'MATCH_NOT_PUBLISHED' as const };
      }

      if (match.startsAt.getTime() <= Date.now()) {
        return { ok: false as const, reason: 'MATCH_ALREADY_STARTED' as const };
      }

      // 2. Límite de 5 entradas por usuario y por partido.
      //    Sólo cuentan las pagas: si contáramos las PENDING, un usuario que
      //    abandonó un par de intentos de compra quedaría bloqueado.
      const userTickets = await tx.ticket.count({
        where: {
          userId: dto.userId,
          matchId: dto.matchId,
          status: { in: SOLD_STATUSES },
        },
      });

      if (userTickets + dto.quantity > MAX_TICKETS_PER_USER_PER_MATCH) {
        return { ok: false as const, reason: 'USER_LIMIT_EXCEEDED' as const };
      }

      // 3. Cupo del partido: capacity del partido pisa la de la cancha.
      const capacity = match.capacity ?? match.court.capacity;
      const occupied = await tx.ticket.count({
        where: { matchId: dto.matchId, status: { in: SOLD_STATUSES } },
      });

      if (occupied + dto.quantity > capacity) {
        return { ok: false as const, reason: 'NOT_ENOUGH_CAPACITY' as const };
      }

      // 4. Crear N tickets independientes (cada uno tendrá su propio código).
      //    createMany no devuelve las filas creadas en MySQL, así que se
      //    crean de a uno. Con un máximo de 5 el costo es despreciable.
      const created: TicketWithRelations[] = [];

      for (let i = 0; i < dto.quantity; i++) {
        const ticket = await tx.ticket.create({
          data: {
            userId: dto.userId,
            matchId: dto.matchId,
            pricePaid: match.price, // snapshot del precio al momento de reservar
            status: TicketStatus.PENDING,
            // code queda null: recién se genera cuando el pago se confirma
          },
          include: TICKET_INCLUDE,
        });
        created.push(ticket);
      }

      return { ok: true as const, data: created };
    });
  },

    /**
   * Confirma las entradas de una orden de pago aprobada.
   * La llama el webhook de MercadoPago.
   *
   * Recibe los ids concretos porque son los que viajan en el
   * external_reference de la orden: deducirlos por usuario y partido
   * confirmaría también reservas hechas después de iniciar el pago.
   *
   * Filtrar por PENDING da idempotencia: MercadoPago reintenta las
   * notificaciones y en la segunda no queda nada para confirmar.
   *
   * No se revalida el cupo: si el pago se aprobó, la entrada se entrega.
   * El control de cupo y de límite por usuario se hace al reservar.
   */
  async confirmPayment(
    ticketIds: number[],
    mpPaymentId: string,
  ): Promise<TicketWithRelations[]> {
    return prisma.$transaction(async (tx) => {
      const pending = await tx.ticket.findMany({
        where: {
          id: { in: ticketIds },
          status: TicketStatus.PENDING,
        },
        select: { id: true, matchId: true },
      });

      const confirmed: TicketWithRelations[] = [];

      for (const { id, matchId } of pending) {
        // El status va también en el where del update: con dos notificaciones
        // simultáneas, las dos pasan el findMany, pero el UPDATE relee la fila
        // después de esperar el lock y solo una la encuentra PENDING. Sin esto,
        // la segunda regeneraría el código y el que ya tiene el usuario
        // dejaría de valer. updateMany en vez de update porque no tira error
        // cuando no hay coincidencia.
        const { count } = await tx.ticket.updateMany({
          where: { id, status: TicketStatus.PENDING },
          data: {
            status: TicketStatus.ACTIVE,
            code: await generateUniqueCode(tx, matchId),
            mpPaymentId,
            // mpOrderId se conserva: es la trazabilidad de la orden y lo que
            // permite reencontrar estos tickets cuando MercadoPago reintenta
            // la notificación.
          },
        });

        if (count === 0) continue; // otra notificación la confirmó primero

        const ticket = await tx.ticket.findUniqueOrThrow({
          where: { id },
          include: TICKET_INCLUDE,
        });
        confirmed.push(ticket);
      }

      return confirmed;
    });
  },

    /**
   * Trae los tickets de una compra para validarlos antes de crear la orden.
   * Devuelve sólo lo necesario para decidir si el pago puede iniciarse.
   */
  async findForPayment(ticketIds: number[]) {
    return prisma.ticket.findMany({
      where: { id: { in: ticketIds } },
      select: {
        id: true,
        userId: true,
        matchId: true,
        status: true,
        pricePaid: true,
        mpOrderId: true,
      },
    });
  },

  /**
   * Asocia la orden de MercadoPago a los tickets.
   *
   * Sólo actualiza las PENDING: una entrada ya confirmada conserva la orden
   * con la que se pagó.
   */
  async attachOrder(ticketIds: number[], mpOrderId: string): Promise<number> {
    const { count } = await prisma.ticket.updateMany({
      where: { id: { in: ticketIds }, status: TicketStatus.PENDING },
      data: { mpOrderId },
    });
    return count;
  },

  /**
   * Trae los tickets asociados a una orden de MercadoPago.
   *
   * La base es la fuente de verdad sobre qué entradas cubre la orden: el
   * external_reference de la notificación es un dato externo y sólo se usa
   * para contrastar.
   */
  async findByOrderId(mpOrderId: string) {
    return prisma.ticket.findMany({
      where: { mpOrderId },
      select: { id: true, status: true },
    });
  },

  /**
   * Libera las entradas de una orden que no llegó a pagarse.
   *
   * Sólo borra las PENDING: una ACTIVE ya tiene el pago acreditado y el código
   * emitido, y no se toca aunque la orden figure cancelada.
   *
   * Es el mismo criterio de releaseExpired --liberar es borrar la fila-- pero
   * por orden en vez de por vencimiento: acá se sabe que la orden murió y no
   * hace falta esperar a que venza el hold.
   *
   * El estado va dentro del where del delete y no en una búsqueda previa para
   * que las dos condiciones se resuelvan en la misma sentencia: si entre medio
   * se acreditara el pago, esos tickets quedarían ACTIVE y el delete ya no los
   * alcanzaría.
   */
  async releaseByOrderId(mpOrderId: string): Promise<number> {
    const { count } = await prisma.ticket.deleteMany({
      where: { mpOrderId, status: TicketStatus.PENDING },
    });
    return count;
  },
  
  /**
   * Marca una entrada como usada al ingresar al evento.
   *
   * La condición `status: ACTIVE` dentro del where es lo que evita el doble
   * uso: si dos operadores escanean el mismo código simultáneamente, el segundo
   * update no encuentra fila y Prisma lanza P2025, que el controller
   * traduce a 409.
   */
  async markAsUsed(id: number): Promise<TicketWithRelations> {
    return prisma.ticket.update({
      where: { id, status: TicketStatus.ACTIVE },
      data: { status: TicketStatus.USED },
      include: TICKET_INCLUDE,
    });
  },

  async create(dto: CreateTicketDto): Promise<TicketWithRelations> {
    return prisma.ticket.create({ data: dto, include: TICKET_INCLUDE });
  },

  async update(id: number, dto: UpdateTicketDto): Promise<TicketWithRelations> {
    return prisma.ticket.update({
      where: { id },
      data: dto,
      include: TICKET_INCLUDE,
    });
  },
};

/**
 * Vista para el dueño de la entrada.
 * Incluye el code porque es lo que el frontend convierte en código.
 * Oculta los datos del usuario, que ya conoce.
 */
export function toOwnerTicket(ticket: TicketWithRelations) {
  const { user, ...rest } = ticket;
  return rest;
}

/**
 * Vista para el operador que valida en la puerta.
 * Muestra el titular pero oculta datos de pago, que no le competen.
 */
export function toOperatorTicket(ticket: TicketWithRelations) {
  const { mpPaymentId, pricePaid, ...rest } = ticket;
  return rest;
}