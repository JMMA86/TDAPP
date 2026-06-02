// Adaptador de IA con Ollama — Implementación de IAiService
// Este archivo vive en infrastructure y es la implementación concreta del puerto IAiService.
// Usa el paquete `ai-sdk-ollama` con `generateText` (operación batch, no streaming).

import { createOllama, generateText } from 'ai-sdk-ollama';
import type { IAiService, AiMicroTask } from '@/core/application/ports/ai-service.interface';
import { SPLIT_TASK_SYSTEM_PROMPT } from '@/infrastructure/ai/prompts';

const ollama = createOllama({
  baseURL: process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434',
});

// ─── Implementación ───────────────────────────────────────────────────────────

export class OllamaAiService implements IAiService {
  private readonly modelId: string;

  constructor() {
    this.modelId = process.env.OLLAMA_MODEL || 'llama3';
  }

  async splitTask(taskTitle: string, description?: string): Promise<AiMicroTask[]> {
    const userPrompt = description
      ? `Fracciona la siguiente tarea en micro-tareas:\n\nTarea: "${taskTitle}"\nDescripción adicional: ${description}`
      : `Fracciona la siguiente tarea en micro-tareas:\n\nTarea: "${taskTitle}"`;

    const { text } = await generateText({
      model: ollama(this.modelId),
      system: SPLIT_TASK_SYSTEM_PROMPT,
      prompt: userPrompt,
    });

    return this.parseMicroTasks(text);
  }

  /**
   * Parsea la respuesta de la IA para extraer el array de micro-tareas estructuradas.
   * Maneja errores de JSON malformado con estrategias de recuperación.
   */
  private parseMicroTasks(rawText: string): AiMicroTask[] {
    // Intento 1: Parsear directamente como JSON
    try {
      const parsed = JSON.parse(rawText);
      if (Array.isArray(parsed)) {
        return parsed.map(this.normalizeItem);
      }
    } catch {
      // JSON inválido, intentar estrategias de recuperación
    }

    // Intento 2: Extraer el array JSON del texto
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed)) {
          return parsed.map(this.normalizeItem);
        }
      } catch {
        // El fragmento extraído tampoco es JSON válido
      }
    }

    // Intento 3: Fallback — el modelo devolvió strings planos (formato antiguo)
    const lines = rawText
      .split('\n')
      .map((line) => line.replace(/^[\s\d.\-*)]+/, '').trim())
      .filter((line) => line.length > 0);

    if (lines.length >= 2) {
      return lines.slice(0, 4).map((title) => ({
        title,
        difficulty: 'easy' as const,
        estimatedMinutes: 5,
      }));
    }

    // Último recurso: devolver la respuesta completa como una sola micro-tarea
    console.warn(
      '[OllamaAiService] No se pudo parsear la respuesta de la IA como array de micro-tareas. Respuesta original:',
      rawText,
    );
    return [{ title: rawText.trim(), difficulty: 'easy', estimatedMinutes: 5 }];
  }

  /** Normaliza un ítem del array asegurando que tenga los 3 campos requeridos. */
  private normalizeItem(item: unknown): AiMicroTask {
    if (typeof item === 'string') {
      return { title: item, difficulty: 'easy', estimatedMinutes: 5 };
    }
    if (typeof item === 'object' && item !== null) {
      const obj = item as Record<string, unknown>;
      const difficulty = String(obj.difficulty || 'easy').toLowerCase();
      const validDifficulty = ['easy', 'medium', 'hard'].includes(difficulty)
        ? (difficulty as 'easy' | 'medium' | 'hard')
        : 'easy';
      return {
        title: String(obj.title || ''),
        difficulty: validDifficulty,
        estimatedMinutes: Math.min(Math.max(Number(obj.estimatedMinutes) || 5, 2), 15),
      };
    }
    return { title: String(item || ''), difficulty: 'easy', estimatedMinutes: 5 };
  }
}
