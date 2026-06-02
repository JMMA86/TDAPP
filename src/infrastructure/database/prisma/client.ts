// Singleton de PrismaClient — Capa de infraestructura
// Centraliza la creación del cliente de base de datos con el adapter de PostgreSQL.
// Usa el patrón globalThis para evitar múltiples instancias en hot-reload de Next.js.

import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

function createPrismaClient(): PrismaClient {
  // POSTGRES_URL_NON_POOLING is the Vercel/Supabase integration var — no pgbouncer flag.
  // DATABASE_URL is the local fallback. pgbouncer=true is a Prisma CLI param, not valid for pg.Pool.
  const connectionString =
    process.env.POSTGRES_URL_NON_POOLING ?? process.env.DATABASE_URL;
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
