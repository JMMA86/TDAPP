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

const SPLIT_TASK_SYSTEM_PROMPT = `Eres un sistema de salida JSON. No eres un asistente conversacional. No saludes. No expliques.

Tu trabajo: recibir un título de tarea y devolver EXACTAMENTE un array JSON de 3 o 4 strings.

FORMATO OBLIGATORIO — copia esta estructura exacta:
["acción concreta de 5-15 min", "acción concreta de 5-15 min", "acción concreta de 5-15 min"]

REGLAS:
- Salida: SOLO el array JSON. CERO texto antes o después.
- Cada ítem: acción concreta y verificable, 5-15 minutos.
- Usa palabras DIFERENTES al título de la tarea padre. NUNCA repitas el título original.
- Orden: de más simple a más compleja.

EJEMPLO 1:
Tarea padre: "Hacer la tarea de matemáticas"
["Abrir el libro en la página asignada y leer el enunciado en voz alta", "Escribir la fórmula principal y sustituir los datos conocidos", "Revisar el resultado y pasarlo limpio al cuaderno"]

EJEMPLO 2:
Tarea padre: "Renovar la licencia de conducir"
["Buscar en el cajón los papeles del carro y la identificación", "Entrar al sitio web oficial y llenar solo los datos personales", "Subir la foto requerida y guardar el comprobante de pago"]

PROHIBIDO:
- CUALQUIER TEXTO FUERA DEL ARRAY JSON
- REPETIR EL TÍTULO DE LA TAREA PADRE
- INTRODUCCIONES ("Aquí tienes...", "Entiendo que...")
- CONCLUSIONES O EXPLICACIONES
- LISTAS CON VIÑETAS O NÚMEROS
- MÁS DE 4 MICRO-TAREAS`;

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
