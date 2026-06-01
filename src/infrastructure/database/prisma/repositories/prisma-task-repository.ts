// Implementación Prisma del repositorio de tareas
// Adaptador concreto que cumple ITaskRepository usando PrismaClient.

import { PrismaClient, TaskStatus as PrismaTaskStatus } from '@/generated/prisma/client';
import type {
  ITaskRepository,
  Task,
  SubTask,
  CreateTaskInput,
  CreateSubTaskInput,
  TaskFilters,
  TaskStatus,
  Priority,
  TaskType,
  Difficulty,
} from '@/core/application/ports/task-repository.interface';

// ─── Mappers (transformación pura de estructuras, sin lógica de negocio) ──────

/** Convierte un registro Prisma Task a la entidad de dominio Task. */
function toDomainTask(record: {
  id: string;
  title: string;
  description: string | null;
  status: PrismaTaskStatus;
  priority: string;
  taskType: string;
  dueDate: Date | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  subTasks?: {
    id: string;
    title: string;
    isCompleted: boolean;
    orden: number;
    difficulty: string;
    estimatedMinutes: number;
    taskId: string;
    createdAt: Date;
  }[];
}): Task {
  return {
    id: record.id,
    title: record.title,
    description: record.description,
    status: record.status as TaskStatus,
    priority: record.priority as Priority,
    taskType: record.taskType as TaskType,
    dueDate: record.dueDate,
    userId: record.userId,
    subTasks: record.subTasks?.map(toDomainSubTask),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

/** Convierte un registro Prisma SubTask a la entidad de dominio SubTask. */
function toDomainSubTask(record: {
  id: string;
  title: string;
  isCompleted: boolean;
  orden: number;
  difficulty: string;
  estimatedMinutes: number;
  taskId: string;
  createdAt: Date;
}): SubTask {
  return {
    id: record.id,
    title: record.title,
    isCompleted: record.isCompleted,
    orden: record.orden,
    difficulty: record.difficulty as Difficulty,
    estimatedMinutes: record.estimatedMinutes,
    taskId: record.taskId,
    createdAt: record.createdAt,
  };
}

// ─── Implementación ───────────────────────────────────────────────────────────

export class PrismaTaskRepository implements ITaskRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createTask(userId: string, data: CreateTaskInput): Promise<Task> {
    const record = await this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        status: (data.status ?? 'PENDING') as PrismaTaskStatus,
        priority: (data.priority ?? 'MEDIUM') as Priority,
        taskType: (data.taskType ?? 'MICRO_TASK') as 'MICRO_TASK' | 'REMINDER' | 'GOAL',
        dueDate: data.dueDate ?? null,
        userId,
      },
    });

    return toDomainTask(record);
  }

  async getTasksByUser(userId: string, filters?: TaskFilters): Promise<Task[]> {
    const where: Record<string, unknown> = { userId };

    if (filters?.status) {
      where.status = filters.status as PrismaTaskStatus;
    }

    if (filters?.priority) {
      where.priority = filters.priority;
    }

    if (filters?.overdue) {
      where.dueDate = { lt: new Date() };
      where.status = { not: 'COMPLETED' as PrismaTaskStatus };
    }

    const records = await this.prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { subTasks: { orderBy: { orden: 'asc' } } },
    });

    return records.map(toDomainTask);
  }

  async getTaskById(taskId: string): Promise<Task | null> {
    const record = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { subTasks: { orderBy: { orden: 'asc' } } },
    });

    return record ? toDomainTask(record) : null;
  }

  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<Task> {
    const record = await this.prisma.task.update({
      where: { id: taskId },
      data: { status: status as PrismaTaskStatus },
    });

    return toDomainTask(record);
  }

  async createSubTask(taskId: string, data: CreateSubTaskInput): Promise<SubTask> {
    const record = await this.prisma.subTask.create({
      data: {
        title: data.title,
        orden: data.orden ?? 0,
        difficulty: (data.difficulty ?? 'EASY') as 'EASY' | 'MEDIUM' | 'HARD',
        estimatedMinutes: data.estimatedMinutes ?? 5,
        taskId,
      },
    });

    return toDomainSubTask(record);
  }

  async getSubTasksByTask(taskId: string): Promise<SubTask[]> {
    const records = await this.prisma.subTask.findMany({
      where: { taskId },
      orderBy: { orden: 'asc' },
    });

    return records.map(toDomainSubTask);
  }

  async updateSubTaskStatus(subTaskId: string, isCompleted: boolean): Promise<SubTask> {
    const record = await this.prisma.subTask.update({
      where: { id: subTaskId },
      data: { isCompleted },
    });

    return toDomainSubTask(record);
  }

  async completeAllSubTasks(taskId: string): Promise<void> {
    await this.prisma.subTask.updateMany({
      where: { taskId },
      data: { isCompleted: true },
    });
  }

  async uncompleteAllSubTasks(taskId: string): Promise<void> {
    await this.prisma.subTask.updateMany({
      where: { taskId },
      data: { isCompleted: false },
    });
  }

  async deleteTask(taskId: string): Promise<void> {
    await this.prisma.task.delete({
      where: { id: taskId },
    });
  }
}
