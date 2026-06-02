// Adaptador de IA con Groq — Implementación de IAiService
// Usa @ai-sdk/groq + generateText (operación batch, no streaming).
// Activa este proveedor con AI_PROVIDER=groq en las variables de entorno.

import { createGroq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import type { IAiService, AiMicroTask } from '@/core/application/ports/ai-service.interface';
import { SPLIT_TASK_SYSTEM_PROMPT } from '@/infrastructure/ai/prompts';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export class GroqAiService implements IAiService {
  private readonly modelId: string;

  constructor() {
    this.modelId = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
  }

  async splitTask(taskTitle: string, description?: string): Promise<AiMicroTask[]> {
    const userPrompt = description
      ? `Fracciona la siguiente tarea en micro-tareas:\n\nTarea: "${taskTitle}"\nDescripción adicional: ${description}`
      : `Fracciona la siguiente tarea en micro-tareas:\n\nTarea: "${taskTitle}"`;

    const { text } = await generateText({
      model: groq(this.modelId),
      system: SPLIT_TASK_SYSTEM_PROMPT,
      prompt: userPrompt,
    });

    return this.parseMicroTasks(text);
  }

  private parseMicroTasks(rawText: string): AiMicroTask[] {
    try {
      const parsed = JSON.parse(rawText);
      if (Array.isArray(parsed)) return parsed.map(this.normalizeItem);
    } catch { /* sigue al siguiente intento */ }

    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed)) return parsed.map(this.normalizeItem);
      } catch { /* sigue al siguiente intento */ }
    }

    const lines = rawText
      .split('\n')
      .map((l) => l.replace(/^[\s\d.\-*)]+/, '').trim())
      .filter((l) => l.length > 0);

    if (lines.length >= 2) {
      return lines.slice(0, 4).map((title) => ({ title, difficulty: 'easy' as const, estimatedMinutes: 5 }));
    }

    console.warn('[GroqAiService] No se pudo parsear la respuesta:', rawText);
    return [{ title: rawText.trim(), difficulty: 'easy', estimatedMinutes: 5 }];
  }

  private normalizeItem(item: unknown): AiMicroTask {
    if (typeof item === 'string') return { title: item, difficulty: 'easy', estimatedMinutes: 5 };
    if (typeof item === 'object' && item !== null) {
      const obj = item as Record<string, unknown>;
      const d = String(obj.difficulty || 'easy').toLowerCase();
      return {
        title: String(obj.title || ''),
        difficulty: (['easy', 'medium', 'hard'].includes(d) ? d : 'easy') as AiMicroTask['difficulty'],
        estimatedMinutes: Math.min(Math.max(Number(obj.estimatedMinutes) || 5, 2), 15),
      };
    }
    return { title: String(item || ''), difficulty: 'easy', estimatedMinutes: 5 };
  }
}
