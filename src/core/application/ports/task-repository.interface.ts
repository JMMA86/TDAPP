// Puerto del repositorio de tareas — Contrato de dominio
// Este archivo define la interfaz y los tipos de dominio puros.
// NO debe importar nada de infrastructure ni de Prisma.

// ─── Enums de dominio ─────────────────────────────────────────────────────────

/** Estado de una tarea, incluye ABANDONED para salud mental (sin penalización). */
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';

/** Prioridad de la tarea según REQUIREMENTS.md sección 3B. */
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

// ─── Entidades de dominio ─────────────────────────────────────────────────────

/** Representación pura de una Task en el dominio. */
export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate: Date | null;
  userId: string;
  subTasks?: SubTask[];
  createdAt: Date;
  updatedAt: Date;
}

/** Representación pura de una SubTask (micro-tarea) en el dominio. */
export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
  orden: number;
  taskId: string;
  createdAt: Date;
}

// ─── DTOs de entrada ──────────────────────────────────────────────────────────

/** Datos necesarios para crear una tarea principal. */
export interface CreateTaskInput {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: Date | null;
}

/** Filtros opcionales para consultar tareas de un usuario. */
export interface TaskFilters {
  status?: TaskStatus;
  priority?: Priority;
  /** Si es true, solo devuelve tareas con dueDate en el pasado y status != COMPLETED. */
  overdue?: boolean;
}

/** Datos necesarios para crear una subtarea (micro-tarea). */
export interface CreateSubTaskInput {
  title: string;
  orden?: number;
}

// ─── Interfaz del puerto ──────────────────────────────────────────────────────

/**
 * Contrato del repositorio de tareas.
 * Las implementaciones concretas (Prisma, mock, etc.) deben cumplir esta interfaz.
 * Los casos de uso dependen únicamente de este contrato (inversión de dependencias).
 */
export interface ITaskRepository {
  /** Crea una nueva tarea para el usuario dado. */
  createTask(userId: string, data: CreateTaskInput): Promise<Task>;

  /** Obtiene las tareas de un usuario, opcionalmente filtradas. */
  getTasksByUser(userId: string, filters?: TaskFilters): Promise<Task[]>;

  /** Busca una tarea por su ID. Devuelve null si no existe. */
  getTaskById(taskId: string): Promise<Task | null>;

  /** Actualiza el estado de una tarea existente. */
  updateTaskStatus(taskId: string, status: TaskStatus): Promise<Task>;

  /** Crea una subtarea asociada a una tarea padre. */
  createSubTask(taskId: string, data: CreateSubTaskInput): Promise<SubTask>;

  /** Obtiene todas las subtareas de una tarea, ordenadas por `orden`. */
  getSubTasksByTask(taskId: string): Promise<SubTask[]>;

  /** Marca o desmarca una subtarea individual como completada. */
  updateSubTaskStatus(subTaskId: string, isCompleted: boolean): Promise<SubTask>;

  /** Marca todas las subtareas de una tarea como completadas. */
  completeAllSubTasks(taskId: string): Promise<void>;

  /** Desmarca todas las subtareas de una tarea. */
  uncompleteAllSubTasks(taskId: string): Promise<void>;

  /** Elimina una tarea y sus subtareas asociadas (CASCADE). */
  deleteTask(taskId: string): Promise<void>;
}
