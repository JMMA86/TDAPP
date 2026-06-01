// Route Handler: POST /api/tasks — Crear tarea | GET /api/tasks — Listar tareas | PATCH /api/tasks — Actualizar estado
// Controlador delgado: solo valida, invoca repositorio y formatea respuesta.

import { prisma } from '@/infrastructure/database/prisma/client';
import { PrismaTaskRepository } from '@/infrastructure/database/prisma/repositories/prisma-task-repository';
import type { TaskStatus } from '@/core/application/ports/task-repository.interface';

const VALID_STATUSES: TaskStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED'];

const taskRepo = new PrismaTaskRepository(prisma);

export async function POST(req: Request) {
  try {
    const { userId, title, description, status, priority, dueDate } = await req.json();

    if (!userId || !title) {
      return Response.json({ error: 'userId y title son obligatorios' }, { status: 400 });
    }

    const task = await taskRepo.createTask(userId, {
      title,
      description,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    return Response.json(task, { status: 201 });
  } catch (error) {
    console.error('[POST /api/tasks] Error:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const userId = new URL(req.url).searchParams.get('userId');

    if (!userId) {
      return Response.json({ error: 'userId es obligatorio' }, { status: 400 });
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
    const { taskId, status } = await req.json();

    if (!taskId || !status || !VALID_STATUSES.includes(status)) {
      return Response.json(
        { error: 'taskId y un status válido (PENDING, IN_PROGRESS, COMPLETED, ABANDONED) son obligatorios' },
        { status: 400 },
      );
    }

    const updatedTask = await taskRepo.updateTaskStatus(taskId, status as TaskStatus);
    return Response.json(updatedTask, { status: 200 });
  } catch (error) {
    console.error('[PATCH /api/tasks] Error:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
