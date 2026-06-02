// Route Handler: POST /api/mood — Registrar estado de ánimo | GET /api/mood — Últimos 7 días

import { getCurrentUserId } from '@/infrastructure/auth/get-current-user';
import { prisma } from '@/infrastructure/database/prisma/client';

export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return Response.json({ error: 'No autorizado' }, { status: 401 });

    const { score, note } = await req.json();

    if (typeof score !== 'number' || score < 1 || score > 5) {
      return Response.json({ error: 'score debe ser un número entre 1 y 5' }, { status: 400 });
    }

    const entry = await prisma.moodEntry.create({
      data: { userId, score: Math.round(score), note: note?.trim() || null },
    });

    return Response.json(entry, { status: 201 });
  } catch (error) {
    console.error('[POST /api/mood]', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return Response.json({ error: 'No autorizado' }, { status: 401 });

    const since = new Date();
    since.setDate(since.getDate() - 7);

    const entries = await prisma.moodEntry.findMany({
      where: { userId, createdAt: { gte: since } },
      orderBy: { createdAt: 'asc' },
      take: 14,
    });

    return Response.json(entries, { status: 200 });
  } catch (error) {
    console.error('[GET /api/mood]', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
