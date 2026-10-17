import { defineConfig } from 'vitest/config';
import { config } from 'dotenv';

const testEnv = config({ path: '.env.test' }).parsed ?? {};

export default defineConfig({
  test: {
    env: testEnv,
    globalSetup: ['./tests/globalSetup.ts'],
    fileParallelism: false,
  },
});