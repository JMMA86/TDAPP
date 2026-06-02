// Route Handler: GET /api/agente/conversations — lista conversaciones del usuario
//                POST /api/agente/conversations — crea una conversación vacía

import { getCurrentUserId } from '@/infrastructure/auth/get-current-user';
import { prisma } from '@/infrastructure/database/prisma/client';

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return Response.json({ error: 'No autorizado' }, { status: 401 });

    const conversations = await prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, title: true, updatedAt: true },
      take: 50,
    });

    return Response.json(conversations, { status: 200 });
  } catch (error) {
    console.error('[GET /api/agente/conversations]', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return Response.json({ error: 'No autorizado' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const title = typeof body?.title === 'string' ? body.title.trim().slice(0, 80) || null : null;

    const conversation = await prisma.conversation.create({
      data: { userId, title },
      select: { id: true, title: true, updatedAt: true },
    });

    return Response.json(conversation, { status: 201 });
  } catch (error) {
    console.error('[POST /api/agente/conversations]', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
