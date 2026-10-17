import { execSync } from 'node:child_process';
import { config } from 'dotenv';

export default function setup() {
  const url = config({ path: '.env.test' }).parsed?.DATABASE_URL;

  const dbName = url ? new URL(url).pathname.slice(1) : '';
  if (!dbName.endsWith('_test')) {
    throw new Error(
      `La base de tests tiene que terminar en "_test" y es "${dbName}". ` +
        'Revisá DATABASE_URL en backend/.env.test.',
    );
  }

  execSync('npx prisma migrate reset --force --skip-seed', {
    env: { ...process.env, DATABASE_URL: url },
    stdio: 'inherit',
  });
}