import { prisma } from '@/infrastructure/database/prisma/client';
import { PrismaTaskRepository } from '@/infrastructure/database/prisma/repositories/prisma-task-repository';
import { getCurrentUserId } from '@/infrastructure/auth/get-current-user';
import type { TaskStatus } from '@/core/application/ports/task-repository.interface';

const VALID_STATUSES: TaskStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED'];

const taskRepo = new PrismaTaskRepository(prisma);

export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return Response.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { title, description, status, priority, taskType, dueDate } = await req.json();

    if (!title) {
      return Response.json({ error: 'title es obligatorio' }, { status: 400 });
    }

    const task = await taskRepo.createTask(userId, {
      title,
      description,
      status,
      priority,
      taskType,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    return Response.json(task, { status: 201 });
  } catch (error) {
    console.error('[POST /api/tasks] Error:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return Response.json({ error: 'No autorizado' }, { status: 401 });
    }

    const tasks = await taskRepo.getTasksByUser(userId);
    return Response.json(tasks, { status: 200 });
  } catch (error) {
    console.error('[GET /api/tasks] Error:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return Response.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { taskId, status } = await req.json();

    if (!taskId || !status || !VALID_STATUSES.includes(status)) {
      return Response.json(
        { error: 'taskId y un status valido (PENDING, IN_PROGRESS, COMPLETED, ABANDONED) son obligatorios' },
        { status: 400 },
      );
    }

    const task = await taskRepo.getTaskById(taskId);
    if (!task || task.userId !== userId) {
      return Response.json({ error: 'Tarea no encontrada' }, { status: 404 });
    }

    const updatedTask = await taskRepo.updateTaskStatus(taskId, status as TaskStatus);

    if (status === 'COMPLETED') {
      await taskRepo.completeAllSubTasks(taskId);
    } else if (status === 'PENDING') {
      await taskRepo.uncompleteAllSubTasks(taskId);
    }

    return Response.json(updatedTask, { status: 200 });
  } catch (error) {
    console.error('[PATCH /api/tasks] Error:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return Response.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { taskId } = await req.json();

    if (!taskId) {
      return Response.json({ error: 'taskId es obligatorio' }, { status: 400 });
    }

    const task = await taskRepo.getTaskById(taskId);
    if (!task || task.userId !== userId) {
      return Response.json({ error: 'Tarea no encontrada' }, { status: 404 });
    }

    await taskRepo.deleteTask(taskId);
    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[DELETE /api/tasks] Error:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
