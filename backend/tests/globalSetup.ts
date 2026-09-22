import { execSync } from 'node:child_process';
import { config } from 'dotenv';

// Vitest ejecuta esta función una sola vez, antes de correr los tests.
// Corre en el proceso principal, que no recibe el `env` del config, así que
// lee .env.test por su cuenta.
export default function setup() {
  const url = config({ path: '.env.test' }).parsed?.DATABASE_URL;

  // Protección: migrate reset borra la base entera. Si .env.test falta o
  // apunta a una base que no termina en _test (por ejemplo la de desarrollo),
  // frenamos antes de tocar nada.
  const dbName = url ? new URL(url).pathname.slice(1) : '';
  if (!dbName.endsWith('_test')) {
    throw new Error(
      `La base de tests tiene que terminar en "_test" y es "${dbName}". ` +
        'Revisá DATABASE_URL en backend/.env.test.',
    );
  }

  // Deja la base vacía y con todas las migraciones aplicadas. Si no existe,
  // la crea. --skip-seed: cada test arma exactamente los datos que necesita.
  execSync('npx prisma migrate reset --force --skip-seed', {
    env: { ...process.env, DATABASE_URL: url },
    stdio: 'inherit',
  });
}