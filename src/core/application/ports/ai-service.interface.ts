// Puerto del servicio de IA — Contrato de dominio
// Este archivo define la interfaz que abstrae las operaciones de inteligencia artificial.
// NO debe importar nada de infrastructure ni de ningún proveedor de IA específico.
// Los casos de uso dependen únicamente de este contrato (inversión de dependencias).

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
   * de 5-15 minutos cada una.
   *
   * @param taskTitle - Título de la tarea principal que el usuario quiere fraccionar.
   * @param description - Descripción opcional con contexto adicional de la tarea.
   * @returns Un array de strings, cada uno describiendo una micro-tarea accionable.
   *          Se esperan entre 3 y 4 micro-tareas.
   */
  splitTask(taskTitle: string, description?: string): Promise<string[]>;
}
