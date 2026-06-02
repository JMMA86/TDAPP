// Fábrica de proveedores de IA.
// Selecciona OllamaAiService o GroqAiService según la variable AI_PROVIDER.
// Los casos de uso y route handlers solo importan esta función.

import type { IAiService } from '@/core/application/ports/ai-service.interface';

export function createAiService(): IAiService {
  const provider = (process.env.AI_PROVIDER || 'ollama').toLowerCase();

  if (provider === 'groq') {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY es obligatoria cuando AI_PROVIDER=groq');
    }
    // Importación dinámica para no arrastrar @ai-sdk/groq al bundle cuando se usa Ollama
    const { GroqAiService } = require('@/infrastructure/groq/groq-ai-service');
    return new GroqAiService() as IAiService;
  }

  const { OllamaAiService } = require('@/infrastructure/ollama/ollama-ai-service');
  return new OllamaAiService() as IAiService;
}
