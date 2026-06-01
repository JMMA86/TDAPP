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
  taskId: string;
  userId: string;
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

export class SplitTaskUseCase {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly aiService: IAiService,
  ) {}

  async execute(input: SplitTaskInput): Promise<SplitTaskOutput> {
    // Paso 1: Obtener la tarea existente (no crear una nueva)
    const task = await this.taskRepository.getTaskById(input.taskId);
    if (!task) {
      throw new Error(`Tarea con id ${input.taskId} no encontrada`);
    }

    // Paso 2: Invocar la IA para fraccionar la tarea
    let microTaskDescriptions: string[];
    let aiFailed = false;

    try {
      microTaskDescriptions = await this.aiService.splitTask(
        task.title,
        task.description ?? undefined,
      );
    } catch (error) {
      console.error('[SplitTaskUseCase] Error al invocar la IA para fraccionar la tarea:', error);
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
