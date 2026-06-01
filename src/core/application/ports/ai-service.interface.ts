// Puerto del servicio de IA — Contrato de dominio
// Este archivo define la interfaz que abstrae las operaciones de inteligencia artificial.
// NO debe importar nada de infrastructure ni de ningún proveedor de IA específico.
// Los casos de uso dependen únicamente de este contrato (inversión de dependencias).

/** Micro-tarea generada por la IA con dificultad y tiempo estimado. */
export interface AiMicroTask {
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedMinutes: number;
}

/**
 * Contrato del servicio de IA.
 *
 * Abstrae las operaciones de inteligencia artificial del dominio,
 * permitiendo que los casos de uso interactúen con la IA sin conocer
 * el proveedor concreto (Ollama, OpenAI, etc.).
 *
 * Las implementaciones concretas viven en `src/infrastructure/`.
 */
export interface IAiService {
  /**
   * Descompone una tarea abrumadora en micro-tareas accionables.
   *
   * Según REQUIREMENTS.md (Módulo A, Función 2 — El Fraccionador de Tareas):
   * cuando el usuario expresa sentirse abrumado por una meta grande,
   * el agente debe descomponer ese bloque en 3-4 micro-tareas accionables
   * de 2-15 minutos cada una, con dificultad estimada.
   *
   * @param taskTitle - Título de la tarea principal que el usuario quiere fraccionar.
   * @param description - Descripción opcional con contexto adicional de la tarea.
   * @returns Un array de AiMicroTask, cada uno con título, dificultad y tiempo estimado.
   */
  splitTask(taskTitle: string, description?: string): Promise<AiMicroTask[]>;
}
