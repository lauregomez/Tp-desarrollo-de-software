import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { Category, MatchStatus, TicketStatus } from '@prisma/client';
import { prisma } from '../../src/config/prisma';
import { matchService, toPublicMatch } from '../../src/modules/match/match.service';

const MINUTE = 60 * 1000;

// Ids del escenario que arma cada test en el beforeEach.
let userId: number;
let matchId: number;

// Crea una entrada del partido de prueba con el estado indicado.
// reservedUntil sólo importa para las PENDING: es el vencimiento del hold.
async function addTicket(status: TicketStatus, reservedUntil: Date | null = null) {
  await prisma.ticket.create({
    data: { status, reservedUntil, pricePaid: '2500.00', userId, matchId },
  });
}

// Pide el partido con la consulta real del service y calcula soldOut igual
// que el endpoint público: así se prueba también el filtro de Prisma.
async function isSoldOut(): Promise<boolean> {
  const match = await matchService.findById(matchId);
  if (!match) throw new Error('El partido de prueba no existe');
  return toPublicMatch(match).soldOut;
}

beforeEach(async () => {
  // Limpieza en orden inverso a las claves foráneas.
  await prisma.ticket.deleteMany();
  await prisma.match.deleteMany();
  await prisma.court.deleteMany();
  await prisma.club.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();

  const role = await prisma.role.create({ data: { name: 'USER' } });
  const user = await prisma.user.create({
    data: {
      name: 'Test',
      lastName: 'User',
      email: 'test@arf.com',
      passwordHash: 'no-se-usa-en-estos-tests',
      roleId: role.id,
    },
  });
  const home = await prisma.club.create({ data: { name: 'Club Local' } });
  const away = await prisma.club.create({ data: { name: 'Club Visitante' } });
  // Capacidad 2: con dos lugares ocupados el partido se agota.
  const court = await prisma.court.create({
    data: { name: 'Cancha Test', address: 'Calle Falsa 123', capacity: 2, clubId: home.id },
  });
  const match = await prisma.match.create({
    data: {
      startsAt: new Date(Date.now() + 7 * 24 * 60 * MINUTE),
      price: '2500.00',
      category: Category.PRIMERA,
      homeClubId: home.id,
      awayClubId: away.id,
      courtId: court.id,
      status: MatchStatus.PUBLISHED,
    },
  });

  userId = user.id;
  matchId = match.id;
});

afterAll(async () => {
  // Cierra la conexión para que Vitest termine limpio.
  await prisma.$disconnect();
});

describe('soldOut', () => {
  it('no está agotado sin entradas', async () => {
    expect(await isSoldOut()).toBe(false);
  });

  it('se agota cuando las entradas pagadas llenan la capacidad', async () => {
    await addTicket(TicketStatus.ACTIVE);
    await addTicket(TicketStatus.ACTIVE);
    expect(await isSoldOut()).toBe(true);
  });

  it('cuenta las entradas usadas como lugares ocupados', async () => {
    await addTicket(TicketStatus.ACTIVE);
    await addTicket(TicketStatus.USED);
    expect(await isSoldOut()).toBe(true);
  });

  it('cuenta una reserva PENDING vigente: el lugar está retenido', async () => {
    await addTicket(TicketStatus.ACTIVE);
    await addTicket(TicketStatus.PENDING, new Date(Date.now() + 10 * MINUTE));
    expect(await isSoldOut()).toBe(true);
  });

  it('no cuenta una reserva PENDING vencida: el lugar vuelve a estar libre', async () => {
    // El caso del bug reportado: si el vencimiento se evaluara una sola vez
    // (una constante en vez de la función matchInclude), esta reserva
    // seguiría ocupando lugar y el partido figuraría agotado.
    await addTicket(TicketStatus.ACTIVE);
    await addTicket(TicketStatus.PENDING, new Date(Date.now() - 1 * MINUTE));
    expect(await isSoldOut()).toBe(false);
  });
});