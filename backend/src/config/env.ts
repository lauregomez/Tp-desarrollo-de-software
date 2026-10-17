import 'dotenv/config';

const missing: string[] = [];

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    missing.push(name);
    return '';
  }
  return value;
}

function optionalEnv(name: string, fallback: string): string {
  const value = process.env[name]?.trim();
  return value ? value : fallback;
}

export const env = {
  port: Number(optionalEnv('PORT', '3000')),

  databaseUrl: requireEnv('DATABASE_URL'),

  jwtSecret: requireEnv('JWT_SECRET'),
  jwtExpiresIn: optionalEnv('JWT_EXPIRES_IN', '1d'),

  mpAccessToken: requireEnv('MP_ACCESS_TOKEN'),
  mpWebhookSecret: requireEnv('MP_WEBHOOK_SECRET'),

  mpTestBuyerEmail: process.env.MP_TEST_BUYER_EMAIL?.trim() || undefined,

  backendPublicUrl: requireEnv('BACKEND_PUBLIC_URL'),
  frontendUrl: requireEnv('FRONTEND_URL'),
} as const;

if (missing.length > 0) {
  console.error(
    'Faltan variables de entorno obligatorias:\n' +
      missing.map((name) => `  - ${name}`).join('\n')
  );
  process.exit(1);
}