// Singleton de PrismaClient — Capa de infraestructura
// Centraliza la creación del cliente de base de datos con el adapter de PostgreSQL.
// Usa el patrón globalThis para evitar múltiples instancias en hot-reload de Next.js.

import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

function createPrismaClient(): PrismaClient {
  // POSTGRES_URL_NON_POOLING is the Vercel/Supabase integration var — no pgbouncer flag.
  // DATABASE_URL is the local fallback. pgbouncer=true is a Prisma CLI param, not valid for pg.Pool.
  const rawUrl = process.env.POSTGRES_URL_NON_POOLING ?? process.env.DATABASE_URL;

  // Strip sslmode and pgbouncer from the URL so pg-connection-string doesn't override
  // our explicit ssl config. pg-connection-string ≥v3 treats sslmode=require as verify-full,
  // rejecting Supabase's self-signed cert even when rejectUnauthorized:false is set on Pool.
  let connectionString = rawUrl;
  let isLocal = false;
  if (rawUrl) {
    const url = new URL(rawUrl);
    url.searchParams.delete('sslmode');
    url.searchParams.delete('pgbouncer');
    connectionString = url.toString();
    isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  }

  const pool = new Pool({
    connectionString,
    // Local Postgres (Docker) no soporta SSL; en hosts remotos (Supabase) sí.
    ssl: isLocal ? false : { rejectUnauthorized: false },
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
