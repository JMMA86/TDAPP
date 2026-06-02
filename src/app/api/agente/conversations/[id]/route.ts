// Route Handler: GET /api/agente/conversations/[id] — mensajes de una conversación
//                DELETE /api/agente/conversations/[id] — elimina la conversación

import { getCurrentUserId } from '@/infrastructure/auth/get-current-user';
import { prisma } from '@/infrastructure/database/prisma/client';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return Response.json({ error: 'No autorizado' }, { status: 401 });

    const { id } = await params;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      select: { id: true, userId: true, title: true },
    });

    if (!conversation || conversation.userId !== userId) {
      return Response.json({ error: 'Conversación no encontrada' }, { status: 404 });
    }

    const messages = await prisma.conversationMessage.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'asc' },
      select: { id: true, role: true, content: true, createdAt: true },
    });

    return Response.json({ id: conversation.id, title: conversation.title, messages }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/agente/conversations/[id]]', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return Response.json({ error: 'No autorizado' }, { status: 401 });

    const { id } = await params;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!conversation || conversation.userId !== userId) {
      return Response.json({ error: 'Conversación no encontrada' }, { status: 404 });
    }

    await prisma.conversation.delete({ where: { id } });

    return Response.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('[DELETE /api/agente/conversations/[id]]', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
