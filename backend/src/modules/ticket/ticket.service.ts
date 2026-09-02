import { randomUUID } from 'node:crypto';
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
  HOLD_MINUTES,
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

/**
 * Borra las reservas vencidas de un partido para liberar cupo.
 * Se declara fuera del objeto service porque recibe el cliente
 * transaccional (tx) y así se evitan problemas con `this`.
 *
 * Estrategia: en vez de un cron que limpie periódicamente, se limpia al
 * inicio de cada reserva. El cupo se libera exactamente cuando alguien lo
 * necesita y no hace falta infraestructura extra.
 */
async function releaseExpired(
  tx: Prisma.TransactionClient,
  matchId: number,
): Promise<number> {
  const { count } = await tx.ticket.deleteMany({
    where: {
      matchId,
      status: TicketStatus.PENDING,
      reservedUntil: { lt: new Date() },
    },
  });
  return count;
}

export const ticketService = {
  async findAll(filters: TicketFilters = {}): Promise<TicketWithRelations[]> {
    return prisma.ticket.findMany({
      where: {
        userId: filters.userId,
        matchId: filters.matchId,
        status: filters.status,
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

  async findByCode(code: string): Promise<TicketWithRelations | null> {
    return prisma.ticket.findUnique({
      where: { code },
      include: TICKET_INCLUDE,
    });
  },

  /**
   * Reserva N entradas en estado PENDING con vencimiento a 15 minutos.
   *
   * Todo ocurre dentro de una transacción porque las validaciones de cupo
   * y de límite por usuario sólo son confiables si se ejecutan junto al
   * INSERT. Si validáramos antes y creáramos después, dos compradores
   * simultáneos podrían pasar ambos la validación del último lugar.
   */
  async reserve(
    dto: ReserveTicketDto,
  ): Promise<ServiceResult<TicketWithRelations[], ReserveFailureReason>> {
    return prisma.$transaction(async (tx) => {
      // 1. Liberar cupo de reservas abandonadas.
      await releaseExpired(tx, dto.matchId);

      // 2. Traer el partido junto con la capacidad de la cancha.
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

      // 3. Límite de 5 entradas por usuario y por partido.
      //    Después del paso 1 todas las PENDING que quedan están vigentes,
      //    así que alcanza con contar todas las filas del usuario.
      const userTickets = await tx.ticket.count({
        where: { userId: dto.userId, matchId: dto.matchId },
      });

      if (userTickets + dto.quantity > MAX_TICKETS_PER_USER_PER_MATCH) {
        return { ok: false as const, reason: 'USER_LIMIT_EXCEEDED' as const };
      }

      // 4. Cupo del partido: capacity del partido pisa la de la cancha.
      const capacity = match.capacity ?? match.court.capacity;
      const occupied = await tx.ticket.count({ where: { matchId: dto.matchId } });

      if (occupied + dto.quantity > capacity) {
        return { ok: false as const, reason: 'NOT_ENOUGH_CAPACITY' as const };
      }

      // 5. Crear N tickets independientes (N QR distintos).
      //    createMany no devuelve las filas creadas en MySQL, así que se
      //    crean de a uno. Con un máximo de 5 el costo es despreciable.
      const reservedUntil = new Date(Date.now() + HOLD_MINUTES * 60 * 1000);
      const created: TicketWithRelations[] = [];

      for (let i = 0; i < dto.quantity; i++) {
        const ticket = await tx.ticket.create({
          data: {
            userId: dto.userId,
            matchId: dto.matchId,
            pricePaid: match.price, // snapshot del precio al momento de reservar
            status: TicketStatus.PENDING,
            reservedUntil,
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
   * Confirma las reservas vigentes de un usuario para un partido tras el pago.
   * La va a llamar el webhook de MercadoPago.
   *
   * Genera un code único por ticket (un QR por entrada) usando randomUUID().
   * Es una decisión de seguridad: un código secuencial (ENT-0001, ENT-0002)
   * permitiría adivinar entradas válidas por fuerza bruta. El UUID v4 es
   * criptográficamente impredecible.
   */
  async confirmPayment(
    userId: number,
    matchId: number,
    mpPaymentId: string,
  ): Promise<TicketWithRelations[]> {
    return prisma.$transaction(async (tx) => {
      const pending = await tx.ticket.findMany({
        where: {
          userId,
          matchId,
          status: TicketStatus.PENDING,
          reservedUntil: { gte: new Date() },
        },
        select: { id: true },
      });

      const confirmed: TicketWithRelations[] = [];

      for (const { id } of pending) {
        const ticket = await tx.ticket.update({
          where: { id },
          data: {
            status: TicketStatus.ACTIVE,
            code: randomUUID(),
            mpPaymentId,
            reservedUntil: null, // ya no hay hold que vencer
          },
          include: TICKET_INCLUDE,
        });
        confirmed.push(ticket);
      }

      return confirmed;
    });
  },

  /**
   * Marca una entrada como usada al ingresar al evento.
   *
   * La condición `status: ACTIVE` dentro del where es lo que evita el doble
   * uso: si dos operadores escanean el mismo QR simultáneamente, el segundo
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
 * Incluye el code porque es lo que el frontend convierte en QR.
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
