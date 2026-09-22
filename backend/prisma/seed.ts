import 'dotenv/config';
import { PrismaClient, Category, MatchStatus, TicketStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = process.env.SEED_PASSWORD ?? 'Password123!';

/** Devuelve una fecha desplazada N días desde hoy, a una hora fija. */
function inDays(days: number, hour: number, minute = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date;
}

async function seedRoles() {
  const roles = [
    { id: 1, name: 'ADMIN' },
    { id: 2, name: 'OPERATOR' },
    { id: 3, name: 'USER' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { id: role.id },
      update: { name: role.name },
      create: role,
    });
  }

  console.log(`✓ Roles: ${roles.length}`);
}

async function seedUsers() {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

  const users = [
    { name: 'Laure', lastName: 'Gomez', email: 'laure@arf.com', roleId: 1 },
    { name: 'Morro', lastName: 'Garcia', email: 'morro@arf.com', roleId: 1 },
    { name: 'Santiago', lastName: 'Poy', email: 'poy@arf.com', roleId: 1 },
    { name: 'Roman', lastName: 'Gaido', email: 'roman@arf.com', roleId: 2 },
    { name: 'Jaste', lastName: 'Santos', email: 'jaste@arf.com', roleId: 3 },
    { name: 'Jager', lastName: 'Mateo', email: 'jager@arf.com', roleId: 3 },
  ];

  const created = [];

  for (const user of users) {
    const saved = await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, lastName: user.lastName, roleId: user.roleId },
      create: { ...user, passwordHash },
    });
    created.push(saved);
  }

  console.log(`✓ Usuarios: ${users.length} (password: ${DEFAULT_PASSWORD})`);
  return created;
}

async function seedClubs() {
  const names = [
    'Velocidad y Resistencia',
    'Nueva Defensores',
    'Sportivo Patria',
    'Los Andes',
  ];

  const clubs = await Promise.all(
    names.map((name) =>
      prisma.club.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  console.log(`✓ Clubes: ${clubs.length}`);
  return clubs;
}

async function seedCourts(clubIds: number[]) {
  const courts = [
    { name: 'Cancha 1', address: 'Bv. Oroño 1450, Rosario', capacity: 500, clubId: clubIds[0] },
    { name: 'Cancha 2', address: 'Bv. Oroño 1450, Rosario', capacity: 400, clubId: clubIds[0] },
    { name: 'Cancha Norte', address: 'Av. Alberdi 850, Rosario', capacity: 300, clubId: clubIds[1] },
  ];

  const created = await Promise.all(
    courts.map((court) =>
      prisma.court.upsert({
        where: { clubId_name: { clubId: court.clubId, name: court.name } },
        update: { capacity: court.capacity, address: court.address },
        create: court,
      }),
    ),
  );

  console.log(`✓ Canchas: ${created.length}`);
  return created;
}

async function seedMatches(clubIds: number[], courtIds: number[]) {
  const matches = [
    {
      id: 1,
      startsAt: inDays(5, 20, 30),
      price: '2500.00',
      category: Category.PRIMERA,
      capacity: null,
      homeClubId: clubIds[0],
      awayClubId: clubIds[1],
      courtId: courtIds[0],
      status: MatchStatus.PUBLISHED,
    },
    {
      id: 2,
      startsAt: inDays(7, 18, 0),
      price: '2500.00',
      category: Category.PRIMERA,
      capacity: 200, // override: no se habilita toda la cancha
      homeClubId: clubIds[2],
      awayClubId: clubIds[3],
      courtId: courtIds[1],
      status: MatchStatus.PUBLISHED,
    },
    {
      id: 3,
      startsAt: inDays(12, 21, 0),
      price: '3000.00',
      category: Category.RESERVA,
      capacity: null,
      homeClubId: clubIds[1],
      awayClubId: clubIds[0],
      courtId: courtIds[2],
      status: MatchStatus.DRAFT, // para probar optionalAuthenticate
    },
    {
      id: 4,
      startsAt: inDays(-3, 20, 0),
      price: '2000.00',
      category: Category.PRIMERA,
      capacity: null,
      homeClubId: clubIds[3],
      awayClubId: clubIds[2],
      courtId: courtIds[0],
      status: MatchStatus.FINISHED,
    },
  ];

  for (const match of matches) {
    await prisma.match.upsert({
      where: { id: match.id },
      update: match,
      create: match,
    });
  }

  console.log(`✓ Partidos: ${matches.length}`);
  return matches.map((match) => match.id);
}

/**
 * Entradas de ejemplo para el usuario común, una por estado.
 *
 * Se cargan desde el seed porque todavía no existe el endpoint del pago:
 * `confirmPayment` está en el service pero ninguna ruta lo expone, así que
 * por API sólo se pueden crear entradas PENDING. Sin estos datos no hay
 * forma de probar el listado, el detalle ni el QR.
 */
async function seedTickets(userId: number, matchIds: number[]) {
  // No se usa upsert por id: cuando exista el flujo de compra, las entradas
  // reales van a ocupar esos ids y el seed las sobrescribiría (incluido el
  // dueño). Tampoco sirve upsert por code, porque la PENDING no tiene code.
  // Así que sólo se siembran si el usuario todavía no tiene ninguna: correr
  // el seed de nuevo no duplica ni pisa entradas existentes.
  const existing = await prisma.ticket.count({ where: { userId } });
  if (existing > 0) {
    console.log('✓ Entradas: el usuario ya tiene, no se crean');
    return;
  }

  await prisma.ticket.createMany({
    data: [
      {
        // Reserva sin pagar: vence en 15 minutos contados desde que corre el seed.
        status: TicketStatus.PENDING,
        code: null, // el QR se genera recién al confirmarse el pago
        pricePaid: '2500.00',
        reservedUntil: new Date(Date.now() + 15 * 60 * 1000),
        mpPaymentId: null,
        userId,
        matchId: matchIds[0],
      },
      {
        // Entrada pagada y lista para usar: tiene code y ya no tiene hold.
        // El prefijo "seed-" no puede chocar con un code real, que es un UUID.
        status: TicketStatus.ACTIVE,
        code: 'seed-ticket-active-0001',
        pricePaid: '2500.00',
        reservedUntil: null,
        mpPaymentId: 'seed-payment-0001',
        userId,
        matchId: matchIds[0],
      },
      {
        // Entrada ya usada, asociada al partido finalizado del seed.
        status: TicketStatus.USED,
        code: 'seed-ticket-used-0001',
        pricePaid: '2000.00',
        reservedUntil: null,
        mpPaymentId: 'seed-payment-0002',
        userId,
        matchId: matchIds[3],
      },
    ],
  });

  console.log('✓ Entradas: 3');
}

async function main() {
  console.log('Iniciando seed...\n');

  await seedRoles();
  const users = await seedUsers();

  const clubs = await seedClubs();
  const clubIds = clubs.map((c) => c.id);

  const courts = await seedCourts(clubIds);
  const courtIds = courts.map((c) => c.id);

  const matchIds = await seedMatches(clubIds, courtIds);

  // Jaste recibe las entradas de ejemplo; Jager queda sin entradas para
  // probar el estado vacío de "Mis entradas".
  const buyer = users.find((u) => u.email === 'jaste@arf.com');
  if (buyer) {
    await seedTickets(buyer.id, matchIds);
  }

  console.log('\nSeed completado.');
}

main()
  .catch((error) => {
    console.error('Error en el seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });