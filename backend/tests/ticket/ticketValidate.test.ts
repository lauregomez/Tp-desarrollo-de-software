import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { Category, MatchStatus, TicketStatus } from '@prisma/client';
import app from '../../src/app';
import { prisma } from '../../src/config/prisma';

const PASSWORD = 'Password123!';
const CODE = 'AB12';

// Ids del escenario que arma cada test en el beforeEach.
let matchId: number;
let ticketId: number;

// Pide el token al endpoint de login real: así el test recorre la misma
// cadena que el front (login → authenticate → authorize).
async function loginAs(email: string): Promise<string> {
  const res = await request(app).post('/api/auth/login').send({ email, password: PASSWORD });
  expect(res.status).toBe(200);
  return res.body.token;
}

function validate(token: string) {
  return request(app)
    .post('/api/tickets/validate')
    .set('Authorization', `Bearer ${token}`)
    .send({ code: CODE, matchId });
}

async function ticketStatus(): Promise<TicketStatus> {
  const ticket = await prisma.ticket.findUniqueOrThrow({ where: { id: ticketId } });
  return ticket.status;
}

beforeEach(async () => {
  // Limpieza en orden inverso a las claves foráneas.
  await prisma.ticket.deleteMany();
  await prisma.match.deleteMany();
  await prisma.court.deleteMany();
  await prisma.club.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();

  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const operatorRole = await prisma.role.create({ data: { name: 'OPERATOR' } });
  const userRole = await prisma.role.create({ data: { name: 'USER' } });
  await prisma.user.create({
    data: { name: 'Test', lastName: 'Operator', email: 'operator@arf.com', passwordHash, roleId: operatorRole.id },
  });
  const buyer = await prisma.user.create({
    data: { name: 'Test', lastName: 'User', email: 'user@arf.com', passwordHash, roleId: userRole.id },
  });
  const home = await prisma.club.create({ data: { name: 'Club Local' } });
  const away = await prisma.club.create({ data: { name: 'Club Visitante' } });
  const court = await prisma.court.create({
    data: { name: 'Cancha Test', address: 'Calle Falsa 123', capacity: 100, clubId: home.id },
  });
  const match = await prisma.match.create({
    data: {
      // La validación no mira el horario, sólo que el partido esté publicado.
      // new Date() representa el caso real: el partido se está jugando y el
      // operador valida en la puerta.
      startsAt: new Date(),
      price: '2500.00',
      category: Category.PRIMERA,
      homeClubId: home.id,
      awayClubId: away.id,
      courtId: court.id,
      status: MatchStatus.PUBLISHED,
    },
  });
  // Se crea ya ACTIVE y con código: es el estado en que la deja el webhook
  // de MercadoPago, que este test no recorre.
  const ticket = await prisma.ticket.create({
    data: { status: TicketStatus.ACTIVE, code: CODE, pricePaid: '2500.00', userId: buyer.id, matchId: match.id },
  });

  matchId = match.id;
  ticketId = ticket.id;
});

afterAll(async () => {
  // Cierra la conexión para que Vitest termine limpio.
  await prisma.$disconnect();
});

describe('POST /api/tickets/validate', () => {
  it('el operador valida una entrada activa y queda usada', async () => {
    const res = await validate(await loginAs('operator@arf.com'));

    expect(res.status).toBe(200);
    expect(res.body.valid).toBe(true);
    expect(await ticketStatus()).toBe(TicketStatus.USED);
  });

  it('rechaza un segundo intento con el mismo código', async () => {
    const token = await loginAs('operator@arf.com');
    const first = await validate(token);
    expect(first.status).toBe(200);

    const second = await validate(token);

    expect(second.status).toBe(409);
    expect(second.body.valid).toBe(false);
  });

  it('un USER no puede validar, aunque sea el dueño de la entrada', async () => {
    const res = await validate(await loginAs('user@arf.com'));

    expect(res.status).toBe(403);
    // authorize corta antes del controller: la entrada no se toca.
    expect(await ticketStatus()).toBe(TicketStatus.ACTIVE);
  });
});
