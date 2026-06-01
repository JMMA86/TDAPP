// Route Handler: POST /api/tasks/split — Fraccionar tarea con IA
// Controlador delgado: instancia dependencias, invoca caso de uso y formatea respuesta.

import { prisma } from '@/infrastructure/database/prisma/client';
import { PrismaTaskRepository } from '@/infrastructure/database/prisma/repositories/prisma-task-repository';
import { OllamaAiService } from '@/infrastructure/ollama/ollama-ai-service';
import { SplitTaskUseCase } from '@/core/application/use-cases/split-task.use-case';

const taskRepo = new PrismaTaskRepository(prisma);
const aiService = new OllamaAiService();
const splitTaskUseCase = new SplitTaskUseCase(taskRepo, aiService);

export async function POST(req: Request) {
  try {
    const { userId, taskId } = await req.json();

    if (!userId || !taskId) {
      return Response.json(
        { error: 'userId y taskId son obligatorios' },
        { status: 400 },
      );
    }

    const result = await splitTaskUseCase.execute({ userId, taskId });
    return Response.json(result, { status: 201 });
  } catch (error) {
    console.error('[POST /api/tasks/split] Error:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
