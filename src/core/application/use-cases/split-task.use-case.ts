// Caso de uso: Fraccionar tarea con IA
// Orquesta la creación de una tarea padre y sus micro-tareas generadas por IA.
// Solo depende de puertos de dominio (inversión de dependencias).

import type {
  ITaskRepository,
  Task,
  SubTask,
} from '@/core/application/ports/task-repository.interface';
import type { IAiService } from '@/core/application/ports/ai-service.interface';

// ─── DTOs de entrada y salida ─────────────────────────────────────────────────

/** Datos de entrada para el caso de uso de fraccionamiento de tareas. */
export interface SplitTaskInput {
  userId: string;
  taskTitle: string;
  description?: string;
}

/** Resultado del caso de uso: tarea padre + micro-tareas generadas. */
export interface SplitTaskOutput {
  /** La tarea principal creada (padre). */
  task: Task;
  /** Las micro-tareas generadas por la IA y persistidas. */
  subTasks: SubTask[];
  /** Indica si la IA falló y las subtareas se generaron con fallback. */
  aiFailed: boolean;
}

// ─── Caso de uso ──────────────────────────────────────────────────────────────

/**
 * Caso de uso para fraccionar una tarea abrumadora en micro-tareas accionables.
 *
 * Flujo:
 * 1. Crea la tarea padre en el repositorio con estado PENDING y prioridad MEDIUM.
 * 2. Invoca el servicio de IA para obtener descripciones de micro-tareas.
 * 3. Persiste cada micro-tarea como SubTask de la tarea padre.
 * 4. Retorna la tarea padre junto con sus micro-tareas.
 *
 * Manejo de errores:
 * Si la IA falla, la tarea padre se conserva creada y se retorna con subTasks vacío.
 * Esto garantiza que el usuario no pierda su tarea aunque la IA no esté disponible.
 */
export class SplitTaskUseCase {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly aiService: IAiService,
  ) {}

  async execute(input: SplitTaskInput): Promise<SplitTaskOutput> {
    // Paso 1: Crear la tarea padre
    const task = await this.taskRepository.createTask(input.userId, {
      title: input.taskTitle,
      description: input.description ?? null,
      status: 'PENDING',
      priority: 'MEDIUM',
    });

    // Paso 2: Invocar la IA para fraccionar la tarea
    let microTaskDescriptions: string[];
    let aiFailed = false;

    try {
      microTaskDescriptions = await this.aiService.splitTask(
        input.taskTitle,
        input.description,
      );
    } catch (error) {
      // Si la IA falla, registramos el error pero conservamos la tarea padre
      console.error(
        '[SplitTaskUseCase] Error al invocar la IA para fraccionar la tarea:',
        error,
      );
      aiFailed = true;
      microTaskDescriptions = [];
    }

    // Paso 3: Persistir cada micro-tarea secuencialmente
    const subTasks: SubTask[] = [];

    for (let i = 0; i < microTaskDescriptions.length; i++) {
      try {
        const subTask = await this.taskRepository.createSubTask(task.id, {
          title: microTaskDescriptions[i],
          orden: i,
        });
        subTasks.push(subTask);
      } catch (error) {
        // Si falla la persistencia de una subtarea, registramos y continuamos
        console.error(
          `[SplitTaskUseCase] Error al persistir la micro-tarea "${microTaskDescriptions[i]}":`,
          error,
        );
      }
    }

    // Paso 4: Retornar resultado
    return {
      task,
      subTasks,
      aiFailed,
    };
  }
}
