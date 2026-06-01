// Adaptador de IA con Ollama — Implementación de IAiService
// Este archivo vive en infrastructure y es la implementación concreta del puerto IAiService.
// Usa el paquete `ai-sdk-ollama` con `generateText` (operación batch, no streaming).

import { createOllama, generateText } from 'ai-sdk-ollama';
import type { IAiService } from '@/core/application/ports/ai-service.interface';

// ─── Configuración del proveedor Ollama ───────────────────────────────────────

const ollama = createOllama({
  baseURL: process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434',
});

// ─── Prompt del sistema para fraccionamiento de tareas ────────────────────────

const SPLIT_TASK_SYSTEM_PROMPT = `Eres un asistente especializado en ayudar a jóvenes y estudiantes universitarios con TDAH o ansiedad a organizar sus tareas.

Tu única función es descomponer una tarea grande o abrumadora en micro-tareas pequeñas y accionables.

Reglas estrictas:
- Genera exactamente entre 3 y 4 micro-tareas.
- Cada micro-tarea debe poder completarse en 5 a 15 minutos.
- Usa un lenguaje claro, directo y motivador.
- Cada micro-tarea debe ser un paso concreto y específico, no vago ni genérico.
- Ordena las micro-tareas de forma lógica (de la más sencilla a la más compleja).

Formato de respuesta OBLIGATORIO:
Responde ÚNICAMENTE con un array JSON de strings, sin texto adicional antes ni después.
Ejemplo:
["Abrir el documento y leer el enunciado completo", "Escribir un esquema con las 3 ideas principales", "Redactar el primer párrafo de introducción", "Revisar y corregir ortografía"]`;

// ─── Implementación ───────────────────────────────────────────────────────────

export class OllamaAiService implements IAiService {
  private readonly modelId: string;

  constructor() {
    this.modelId = process.env.OLLAMA_MODEL || 'llama3';
  }

  async splitTask(taskTitle: string, description?: string): Promise<string[]> {
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
   * Parsea la respuesta de la IA para extraer el array de micro-tareas.
   * Maneja errores de JSON malformado con estrategias de recuperación.
   */
  private parseMicroTasks(rawText: string): string[] {
    // Intento 1: Parsear directamente como JSON
    try {
      const parsed = JSON.parse(rawText);
      if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
        return parsed;
      }
    } catch {
      // JSON inválido, intentar estrategias de recuperación
    }

    // Intento 2: Extraer el array JSON del texto (el modelo puede incluir texto extra)
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
          return parsed;
        }
      } catch {
        // El fragmento extraído tampoco es JSON válido
      }
    }

    // Intento 3: Fallback — dividir por líneas y filtrar líneas no vacías
    // Esto cubre el caso donde el modelo devuelve una lista con viñetas o numerada
    const lines = rawText
      .split('\n')
      .map((line) => line.replace(/^[\s\d.\-*)]+/, '').trim())
      .filter((line) => line.length > 0);

    if (lines.length >= 2) {
      return lines.slice(0, 4); // Máximo 4 micro-tareas como fallback
    }

    // Último recurso: devolver la respuesta completa como una sola micro-tarea
    console.warn(
      '[OllamaAiService] No se pudo parsear la respuesta de la IA como array de micro-tareas. Respuesta original:',
      rawText,
    );
    return [rawText.trim()];
  }
}
