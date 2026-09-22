import { defineConfig } from 'vitest/config';
import { config } from 'dotenv';

// Variables de .env.test para los procesos que corren los tests. Así Prisma
// se conecta a la base de test y no a la de desarrollo.
// app.ts llama a dotenv.config(), pero dotenv no pisa variables que ya
// existen: estas ganan.
const testEnv = config({ path: '.env.test' }).parsed ?? {};

export default defineConfig({
  test: {
    env: testEnv,
    // Corre una sola vez antes de todos los tests: resetea la base de test.
    globalSetup: ['./tests/globalSetup.ts'],
    // Los tests de integración comparten la base: si corrieran en paralelo,
    // un archivo podría borrar los datos que otro está usando.
    fileParallelism: false,
  },
});