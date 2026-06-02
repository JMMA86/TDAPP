import { prisma } from '@/infrastructure/database/prisma/client';
import { PrismaTaskRepository } from '@/infrastructure/database/prisma/repositories/prisma-task-repository';
import { OllamaAiService } from '@/infrastructure/ollama/ollama-ai-service';
import { SplitTaskUseCase } from '@/core/application/use-cases/split-task.use-case';
import { getCurrentUserId } from '@/infrastructure/auth/get-current-user';

const taskRepo = new PrismaTaskRepository(prisma);
const aiService = new OllamaAiService();
const splitTaskUseCase = new SplitTaskUseCase(taskRepo, aiService);

export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return Response.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { taskId } = await req.json();

    if (!taskId) {
      return Response.json({ error: 'taskId es obligatorio' }, { status: 400 });
    }

    // Verify task belongs to the authenticated user before calling AI
    const task = await taskRepo.getTaskById(taskId);
    if (!task) {
      return Response.json({ error: 'Tarea no encontrada' }, { status: 404 });
    }
    if (task.userId !== userId) {
      return Response.json({ error: 'No autorizado' }, { status: 403 });
    }

    const result = await splitTaskUseCase.execute({ userId, taskId });
    return Response.json(result, { status: 201 });
  } catch (error) {
    console.error('[POST /api/tasks/split] Error:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
