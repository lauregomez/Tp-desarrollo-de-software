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
  // Clubes reales de fútsal de Rosario, con escudo y año de fundación.
  // Los escudos son URLs externas (rosariofutbol.com): si dejan de responder,
  // el front muestra las iniciales del club como fallback.
  // foundedYear en null: la fuente no informa el año de ese club.
  const LOGO_BASE = 'https://rosariofutbol.com/imagenes/archivos/deportesequipos';

  const clubs = [
    { name: 'Club Velocidad y Resistencia', foundedYear: 1923, logo: 260 },
    { name: 'Club Atlético Rosario Central', foundedYear: 1889, logo: 156 },
    { name: "Club Atlético Newell's Old Boys", foundedYear: 1903, logo: 157 },
    { name: 'Club Atlético Provincial', foundedYear: 1903, logo: 140 },
    { name: 'Club Atlético Horizonte', foundedYear: 1928, logo: 137 },
    { name: 'Unión Sionista Argentina de Rosario', foundedYear: 1983, logo: 145 },
    { name: 'Náutico Sportivo Avellaneda', foundedYear: 1931, logo: 220 },
    { name: 'Club Social Argentino Sirio', foundedYear: 1946, logo: 139 },
    { name: 'Sociedad Tiro Suizo Rosario', foundedYear: 1889, logo: 224 },
    { name: 'Club Atlético Banco Nación', foundedYear: 1943, logo: 237 },
    { name: 'Remeros Alberdi', foundedYear: 1919, logo: 221 },
    { name: 'Echesortu Fútbol Club', foundedYear: 1933, logo: 143 },
    { name: 'Colegio Marista Rosario', foundedYear: null, logo: 251 },
    { name: 'Rosario Rowing Club', foundedYear: 1887, logo: 142 },
    { name: 'Club Atlético Sagrado Corazón', foundedYear: 1939, logo: 222 },
    { name: 'Jockey Club Rosario', foundedYear: 1900, logo: 135 },
    { name: 'Club Residentes Parquefield', foundedYear: 1968, logo: 226 },
    { name: 'Club de Regatas Rosario', foundedYear: 1917, logo: 138 },
    { name: 'Club Universitario', foundedYear: 1924, logo: 254 },
    { name: 'Club Social y Deportivo El Luchador', foundedYear: 1932, logo: 136 },
    { name: 'Universidad Nacional de Rosario', foundedYear: null, logo: 141 },
    { name: 'Club Social y Deportivo Unión Americana', foundedYear: 1941, logo: 144 },
    { name: 'Club Atlético María Madre de La Lata', foundedYear: 2016, logo: 246 },
    { name: 'Club Atlético Talleres Rosario Puerto Belgrano', foundedYear: 1920, logo: 151 },
    { name: 'Club Social y Deportivo Nueva Aurora', foundedYear: 1940, logo: 217 },
    { name: 'Club Atlético Libertad', foundedYear: 1920, logo: 231 },
    { name: 'Club Social y Deportivo Federal', foundedYear: 1943, logo: 235 },
    { name: 'Club Deportivo Unión Central', foundedYear: null, logo: 236 },
    { name: 'Club Social y Deportivo Río Negro', foundedYear: 1939, logo: 107 },
    { name: 'Club Deportivo y Social Lux', foundedYear: 1940, logo: 240 },
    { name: 'Club Atlético Central Córdoba', foundedYear: 1906, logo: 225 },
    { name: 'Club Atlético Social Deportivo y Cultural 1º de Mayo', foundedYear: 1979, logo: 147 },
    { name: 'Club Teléfonos Rosario', foundedYear: 1932, logo: 229 },
    { name: 'Club de Regatas Rosario B', foundedYear: 1917, logo: 138 },
    { name: 'Náutico Sportivo Avellaneda B', foundedYear: 1931, logo: 220 },
  ];

  const created = await Promise.all(
    clubs.map(({ name, foundedYear, logo }) => {
      const data = { foundedYear, logoUrl: `${LOGO_BASE}/${logo}_imagen.png` };
      return prisma.club.upsert({
        where: { name },
        // update también carga logo y año: así, correr el seed sobre una
        // base existente completa los clubes que ya estaban.
        update: data,
        create: { name, ...data },
      });
    }),
  );

  console.log(`✓ Clubes: ${created.length}`);
  return created;
}

async function seedCourts(clubs: { id: number; name: string }[]) {
  const courts = [
    { club: 'Club Velocidad y Resistencia', name: 'Cancha Velocidad y Resistencia', address: 'Urquiza 2737, Rosario', capacity: 400 },
    { club: 'Club Atlético Rosario Central', name: 'Cancha Rosario Central', address: 'Mitre 853, Rosario', capacity: 800 },
    { club: "Club Atlético Newell's Old Boys", name: "Cancha Newell's", address: 'Parque Independencia s/n, Rosario', capacity: 800 },
    { club: 'Club Atlético Provincial', name: 'Cancha Provincial', address: 'Bv. 27 de Febrero 2672, Rosario', capacity: 500 },
    { club: 'Club Atlético Horizonte', name: 'Cancha Horizonte', address: 'Suipacha 1363, Rosario', capacity: 250 },
    { club: 'Unión Sionista Argentina de Rosario', name: 'Cancha Unión Sionista', address: 'Salta 2555, Rosario', capacity: 300 },
    { club: 'Náutico Sportivo Avellaneda', name: 'Cancha Náutico Avellaneda', address: 'Pedro Tuella 952, Rosario', capacity: 400 },
    { club: 'Club Social Argentino Sirio', name: 'Cancha Sirio', address: 'Italia 965, Rosario', capacity: 300 },
    { club: 'Sociedad Tiro Suizo Rosario', name: 'Cancha Tiro Suizo', address: 'Cortada Raffo 5120, Rosario', capacity: 250 },
    { club: 'Club Atlético Banco Nación', name: 'Cancha Banco Nación', address: 'Bv. Rondeau 2932, Rosario', capacity: 300 },
    { club: 'Remeros Alberdi', name: 'Cancha Remeros Alberdi', address: 'Av. Carrasco 2055, Rosario', capacity: 250 },
    { club: 'Colegio Marista Rosario', name: 'Cancha Colegio Marista', address: 'Bv. Oroño 770, Rosario', capacity: 200 },
    { club: 'Rosario Rowing Club', name: 'Cancha Rosario Rowing', address: 'Av. Colombres 1798, Rosario', capacity: 250 },
    { club: 'Club Atlético Sagrado Corazón', name: 'Cancha Sagrado Corazón', address: 'Dorrego 1260, Rosario', capacity: 250 },
    { club: 'Jockey Club Rosario', name: 'Cancha Jockey Club', address: 'Córdoba y Wilde, Rosario', capacity: 300 },
    { club: 'Club Residentes Parquefield', name: 'Cancha Parquefield', address: 'Del Blanqui 2120, Rosario', capacity: 200 },
    { club: 'Club de Regatas Rosario', name: 'Cancha Regatas', address: 'Juan B. Cordiviola 1268, Rosario', capacity: 350 },
    { club: 'Club Universitario', name: 'Cancha Universitario', address: 'Av. del Huerto 1051, Rosario', capacity: 300 },
    { club: 'Universidad Nacional de Rosario', name: 'Cancha UNR', address: 'Moreno 460, Rosario', capacity: 400 },
    { club: 'Club Social y Deportivo Unión Americana', name: 'Cancha Unión Americana', address: 'Brassey 7801 (esq. Colombres), Rosario', capacity: 250 },
    { club: 'Club Atlético María Madre de La Lata', name: 'Cancha La Lata', address: 'Presidente Quintana 1600, Rosario', capacity: 150 },
    { club: 'Club Atlético Talleres Rosario Puerto Belgrano', name: 'Cancha Talleres', address: 'Juan D. Perón 1790, Villa Gobernador Gálvez', capacity: 250 },
    { club: 'Club Social y Deportivo Nueva Aurora', name: 'Cancha Nueva Aurora', address: 'Suipacha 2175, Rosario', capacity: 200 },
    { club: 'Club Atlético Libertad', name: 'Cancha Libertad', address: 'Felipe Moré 1150, Rosario', capacity: 250 },
    { club: 'Club Social y Deportivo Federal', name: 'Cancha Federal', address: 'Zeballos 4649, Rosario', capacity: 250 },
    { club: 'Club Deportivo Unión Central', name: 'Cancha Unión Central', address: 'Iguazú y Junín, Rosario', capacity: 200 },
    { club: 'Club Social y Deportivo Río Negro', name: 'Cancha Río Negro', address: 'Forest 6251, Rosario', capacity: 200 },
    { club: 'Club Deportivo y Social Lux', name: 'Cancha Lux', address: 'Pascual Rosas 403, Rosario', capacity: 250 },
    { club: 'Club Atlético Social Deportivo y Cultural 1º de Mayo', name: 'Cancha 1º de Mayo', address: 'Av. Kennedy y Gianneo, Rosario', capacity: 200 },
    { club: 'Club Teléfonos Rosario', name: 'Cancha Teléfonos', address: 'Buchanan 551, Rosario', capacity: 250 },
  ];

  const clubIdByName = new Map(clubs.map((club) => [club.name, club.id]));

  const created = await Promise.all(
    courts.map(({ club, ...court }) => {
      const clubId = clubIdByName.get(club);
      // Un error de tipeo en el nombre corta el seed con un mensaje claro,
      // en vez de fallar más adelante con un error de Prisma difícil de leer.
      if (clubId === undefined) {
        throw new Error(`Seed: no existe el club "${club}"`);
      }
      return prisma.court.upsert({
        where: { clubId_name: { clubId, name: court.name } },
        update: { capacity: court.capacity, address: court.address },
        create: { ...court, clubId },
      });
    }),
  );

  console.log(`✓ Canchas: ${created.length}`);
  return created;
}

async function seedMatches(
  clubs: { id: number; name: string }[],
  courts: { id: number; name: string }[],
) {
  const clubIdByName = new Map(clubs.map((club) => [club.name, club.id]));
  // En el schema el nombre de cancha es único solo por club, pero en este
  // seed no se repite ninguno, así que alcanza con buscar por nombre.
  const courtIdByName = new Map(courts.map((court) => [court.name, court.id]));

  const idOf = (ids: Map<string, number>, name: string) => {
    const id = ids.get(name);
    // Un error de tipeo corta el seed con un mensaje claro.
    if (id === undefined) {
      throw new Error(`Seed: no existe "${name}"`);
    }
    return id;
  };

  const matches = [
    {
      id: 1,
      startsAt: inDays(5, 20, 30),
      price: '2500.00',
      category: Category.PRIMERA,
      capacity: null,
      home: 'Club Atlético Rosario Central',
      away: "Club Atlético Newell's Old Boys",
      court: 'Cancha Rosario Central',
      status: MatchStatus.PUBLISHED,
    },
    {
      // Ninguno de los dos es dueño de la cancha: la alquilan a Federal.
      id: 2,
      startsAt: inDays(7, 18, 0),
      price: '2500.00',
      category: Category.PRIMERA,
      capacity: 200, // override: no se habilita toda la cancha
      home: 'Echesortu Fútbol Club',
      away: 'Club Social y Deportivo El Luchador',
      court: 'Cancha Federal',
      status: MatchStatus.PUBLISHED,
    },
    {
      id: 3,
      startsAt: inDays(12, 21, 0),
      price: '3000.00',
      category: Category.RESERVA,
      capacity: null,
      home: 'Club de Regatas Rosario',
      away: 'Rosario Rowing Club',
      court: 'Cancha Regatas',
      status: MatchStatus.DRAFT, // para probar optionalAuthenticate
    },
    {
      // Central Córdoba es local en una cancha alquilada a Unión Central.
      id: 4,
      startsAt: inDays(-3, 20, 0),
      price: '2000.00',
      category: Category.PRIMERA,
      capacity: null,
      home: 'Club Atlético Central Córdoba',
      away: 'Náutico Sportivo Avellaneda B',
      court: 'Cancha Unión Central',
      status: MatchStatus.FINISHED,
    },
  ];

  for (const { home, away, court, ...match } of matches) {
    const data = {
      ...match,
      homeClubId: idOf(clubIdByName, home),
      awayClubId: idOf(clubIdByName, away),
      courtId: idOf(courtIdByName, court),
    };
    await prisma.match.upsert({
      where: { id: match.id },
      update: data,
      create: data,
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

  const courts = await seedCourts(clubs);

  const matchIds = await seedMatches(clubs, courts);

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