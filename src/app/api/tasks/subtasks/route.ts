// Route Handler: PATCH /api/tasks/subtasks — Marcar/desmarcar subtarea como completada

import { prisma } from '@/infrastructure/database/prisma/client';
import { PrismaTaskRepository } from '@/infrastructure/database/prisma/repositories/prisma-task-repository';
import { getCurrentUserId } from '@/infrastructure/auth/get-current-user';

const taskRepo = new PrismaTaskRepository(prisma);

export async function PATCH(req: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return Response.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { subTaskId, isCompleted } = await req.json();

    if (!subTaskId || typeof isCompleted !== 'boolean') {
      return Response.json(
        { error: 'subTaskId (string) e isCompleted (boolean) son obligatorios' },
        { status: 400 },
      );
    }

    // Verify ownership: subtask → parent task → user
    const subTask = await taskRepo.getSubTaskById(subTaskId);
    if (!subTask) {
      return Response.json({ error: 'Paso no encontrado' }, { status: 404 });
    }

    const parentTask = await taskRepo.getTaskById(subTask.taskId);
    if (!parentTask || parentTask.userId !== userId) {
      return Response.json({ error: 'No autorizado' }, { status: 403 });
    }

    const updated = await taskRepo.updateSubTaskStatus(subTaskId, isCompleted);
    const taskId = updated.taskId;

    if (isCompleted) {
      const allSubTasks = await taskRepo.getSubTasksByTask(taskId);
      if (allSubTasks.length > 0 && allSubTasks.every((s) => s.isCompleted)) {
        await taskRepo.updateTaskStatus(taskId, 'COMPLETED');
      }
    } else {
      const parent = await taskRepo.getTaskById(taskId);
      if (parent?.status === 'COMPLETED') {
        await taskRepo.updateTaskStatus(taskId, 'PENDING');
      }
    }

    return Response.json(updated, { status: 200 });
  } catch (error) {
    console.error('[PATCH /api/tasks/subtasks] Error:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
