// Route Handler: PATCH /api/tasks/subtasks — Marcar/desmarcar subtarea como completada

import { prisma } from '@/infrastructure/database/prisma/client';
import { PrismaTaskRepository } from '@/infrastructure/database/prisma/repositories/prisma-task-repository';

const taskRepo = new PrismaTaskRepository(prisma);

export async function PATCH(req: Request) {
  try {
    const { subTaskId, isCompleted } = await req.json();

    if (!subTaskId || typeof isCompleted !== 'boolean') {
      return Response.json(
        { error: 'subTaskId (string) e isCompleted (boolean) son obligatorios' },
        { status: 400 },
      );
    }

    const updated = await taskRepo.updateSubTaskStatus(subTaskId, isCompleted);
    const taskId = updated.taskId;

    if (isCompleted) {
      // Si se marca como completado, verificar si TODOS los pasos están listos → completar la principal
      const allSubTasks = await taskRepo.getSubTasksByTask(taskId);
      if (allSubTasks.length > 0 && allSubTasks.every((s) => s.isCompleted)) {
        await taskRepo.updateTaskStatus(taskId, 'COMPLETED');
      }
    } else {
      // Si se desmarca un paso, revertir la principal si estaba COMPLETED
      const parentTask = await taskRepo.getTaskById(taskId);
      if (parentTask?.status === 'COMPLETED') {
        await taskRepo.updateTaskStatus(taskId, 'PENDING');
      }
    }

    return Response.json(updated, { status: 200 });
  } catch (error) {
    console.error('[PATCH /api/tasks/subtasks] Error:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
