import { createOllama, streamText } from 'ai-sdk-ollama';

const ollama = createOllama({
  baseURL: process.env.OLLAMA_BASE_URL,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = await streamText({
      model: ollama(process.env.OLLAMA_MODEL || 'llama3'),
      system: `Eres el agente de IA de TDApp, un asistente empático y estructurado diseñado para ayudar a jóvenes y estudiantes universitarios con TDAH, ansiedad o dificultades de concentración. 
      Tu objetivo es comunicarte de forma clara, con frases cortas y directas para no generar sobrecarga cognitiva. 
      Siempre valida sus emociones con empatía y, si te mencionan una tarea abrumadora, ofréceles dividirla en micro-tareas sencillas de pocos minutos.`,
      messages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Error en el endpoint de Ollama:', error);
    return new Response(JSON.stringify({ error: 'Error al conectar con el servidor de IA local' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}