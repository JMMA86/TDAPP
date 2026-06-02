// Route Handler: POST /api/agente/chat — Agente psicológico general.
// Streaming con contexto del usuario (tareas + ánimo), persistencia de la conversación
// y prompt con salvaguardas clínicas. Proveedor según AI_PROVIDER ("ollama" | "groq").

import { getCurrentUserId } from '@/infrastructure/auth/get-current-user';
import { prisma } from '@/infrastructure/database/prisma/client';
import { PSYCHOLOGIST_SYSTEM_PROMPT, CRISIS_RESPONSE, detectCrisis } from '@/infrastructure/ai/prompts';
import {
  buildAgentContext,
  type AgentContextClient,
} from '@/core/application/use-cases/build-agent-context.use-case';
import type { UIMessage } from 'ai';

function extractText(message: UIMessage | undefined): string {
  if (!message) return '';
  const parts = (message as { parts?: Array<{ type: string; text?: string }> }).parts;
  if (Array.isArray(parts)) {
    return parts
      .filter((p) => p.type === 'text' && typeof p.text === 'string')
      .map((p) => p.text)
      .join('')
      .trim();
  }
  const content = (message as { content?: unknown }).content;
  return typeof content === 'string' ? content.trim() : '';
}

export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return Response.json({ error: 'No autorizado' }, { status: 401 });

    const { conversationId, messages } = (await req.json()) as {
      conversationId?: string;
      messages: UIMessage[];
    };

    if (!conversationId) {
      return Response.json({ error: 'conversationId es obligatorio' }, { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { id: true, userId: true, title: true },
    });
    if (!conversation || conversation.userId !== userId) {
      return Response.json({ error: 'Conversación no encontrada' }, { status: 404 });
    }

    // Persistir el último mensaje del usuario
    const lastUserText = extractText(messages?.[messages.length - 1]);
    if (lastUserText) {
      await prisma.conversationMessage.create({
        data: { conversationId, role: 'USER', content: lastUserText },
      });
      // Título automático a partir del primer mensaje
      if (!conversation.title) {
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { title: lastUserText.slice(0, 60) },
        });
      }
    }

    const persistAssistant = async (text: string) => {
      const clean = text?.trim();
      if (!clean) return;
      await prisma.conversationMessage.create({
        data: { conversationId, role: 'ASSISTANT', content: clean },
      });
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });
    };

    // Salvaguarda determinista: ante señales de crisis NO confiamos en el modelo.
    // Entregamos siempre contención + líneas de ayuda.
    if (detectCrisis(lastUserText)) {
      await persistAssistant(CRISIS_RESPONSE);
      const { createUIMessageStream, createUIMessageStreamResponse } = await import('ai');
      const stream = createUIMessageStream({
        execute: ({ writer }) => {
          writer.write({ type: 'text-start', id: 'crisis' });
          writer.write({ type: 'text-delta', id: 'crisis', delta: CRISIS_RESPONSE });
          writer.write({ type: 'text-end', id: 'crisis' });
        },
      });
      return createUIMessageStreamResponse({ stream });
    }

    const context = await buildAgentContext(
      prisma as unknown as AgentContextClient,
      userId,
    );
    const system = PSYCHOLOGIST_SYSTEM_PROMPT + context;

    const { convertToModelMessages, streamText } = await import('ai');
    const modelMessages = await convertToModelMessages(messages);

    const provider = (process.env.AI_PROVIDER || 'ollama').toLowerCase();

    if (provider === 'groq') {
      const { createGroq } = await import('@ai-sdk/groq');
      const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
      const result = streamText({
        model: groq(process.env.GROQ_MODEL || 'llama-3.1-8b-instant'),
        system,
        messages: modelMessages,
        onFinish: ({ text }) => persistAssistant(text),
      });
      return result.toUIMessageStreamResponse();
    }

    const { createOllama } = await import('ai-sdk-ollama');
    const ollama = createOllama({ baseURL: process.env.OLLAMA_BASE_URL });
    const result = streamText({
      model: ollama(process.env.OLLAMA_MODEL || 'llama3'),
      system,
      messages: modelMessages,
      onFinish: ({ text }) => persistAssistant(text),
    });
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('[POST /api/agente/chat]', error);
    return Response.json({ error: 'Error al conectar con el servicio de IA' }, { status: 500 });
  }
}
