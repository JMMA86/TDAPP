// Route Handler: POST /api/chat — Streaming de chat con el asistente de IA.
// Selecciona el proveedor según AI_PROVIDER: "ollama" (default) o "groq".

import { CHAT_SYSTEM_PROMPT } from '@/infrastructure/ai/prompts';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const provider = (process.env.AI_PROVIDER || 'ollama').toLowerCase();

    if (provider === 'groq') {
      const { createGroq } = await import('@ai-sdk/groq');
      const { streamText } = await import('ai');

      const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
      const result = await streamText({
        model: groq(process.env.GROQ_MODEL || 'llama-3.1-8b-instant'),
        system: CHAT_SYSTEM_PROMPT,
        messages,
      });
      return result.toUIMessageStreamResponse();
    }

    // Default: Ollama
    const { createOllama, streamText } = await import('ai-sdk-ollama');
    const ollama = createOllama({ baseURL: process.env.OLLAMA_BASE_URL });
    const result = await streamText({
      model: ollama(process.env.OLLAMA_MODEL || 'llama3'),
      system: CHAT_SYSTEM_PROMPT,
      messages,
    });
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('[POST /api/chat] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Error al conectar con el servicio de IA' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
