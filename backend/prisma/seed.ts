import 'dotenv/config';
import { PrismaClient, Category, MatchStatus } from '@prisma/client';
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
    { name: 'Carlos',  lastName: 'Méndez',  email: 'admin@arf.com',    roleId: 1 },
    { name: 'Rodrigo', lastName: 'Sánchez', email: 'operador@arf.com', roleId: 2 },
    { name: 'Juan',    lastName: 'García',  email: 'usuario@arf.com',  roleId: 3 },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, lastName: user.lastName, roleId: user.roleId },
      create: { ...user, passwordHash },
    });
  }

  console.log(`✓ Usuarios: ${users.length} (password: ${DEFAULT_PASSWORD})`);
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
    { name: 'Cancha 1', capacity: 500, clubId: clubIds[0] },
    { name: 'Cancha 2', capacity: 400, clubId: clubIds[0] },
    { name: 'Cancha Norte', capacity: 300, clubId: clubIds[1] },
  ];

  const created = await Promise.all(
    courts.map((court) =>
      prisma.court.upsert({
        where: { clubId_name: { clubId: court.clubId, name: court.name } },
        update: { capacity: court.capacity },
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
}

async function main() {
  console.log('Iniciando seed...\n');

  await seedRoles();
  await seedUsers();

  const clubs = await seedClubs();
  const clubIds = clubs.map((c) => c.id);

  const courts = await seedCourts(clubIds);
  const courtIds = courts.map((c) => c.id);

  await seedMatches(clubIds, courtIds);

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