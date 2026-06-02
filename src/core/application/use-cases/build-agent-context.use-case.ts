// Caso de uso: arma un bloque de contexto textual del usuario (tareas + ánimo)
// para inyectarlo al system prompt del agente psicológico.
// Recibe el cliente de datos por parámetro para no acoplar el dominio a la infraestructura.

interface TaskLike {
  title: string;
  status: string;
  dueDate: Date | null;
}

interface MoodLike {
  score: number;
  createdAt: Date;
}

export interface AgentContextClient {
  task: {
    findMany(args: unknown): Promise<TaskLike[]>;
  };
  moodEntry: {
    findMany(args: unknown): Promise<MoodLike[]>;
  };
}

const MOOD_LABELS: Record<number, string> = {
  1: 'muy bajo',
  2: 'bajo',
  3: 'neutro',
  4: 'bien',
  5: 'muy bien',
};

export async function buildAgentContext(
  client: AgentContextClient,
  userId: string,
): Promise<string> {
  const [tasks, moods] = await Promise.all([
    client.task.findMany({
      where: { userId, status: { in: ['PENDING', 'IN_PROGRESS'] } },
      orderBy: { dueDate: 'asc' },
      take: 5,
    }),
    client.moodEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 7,
    }),
  ]);

  const parts: string[] = [];

  if (tasks.length > 0) {
    const list = tasks
      .map((t) => `"${t.title}"${t.status === 'IN_PROGRESS' ? ' (en progreso)' : ''}`)
      .join(', ');
    parts.push(`Tiene ${tasks.length} tarea(s) activa(s): ${list}.`);
  }

  if (moods.length > 0) {
    const recent = moods.slice(0, 3).map((m) => MOOD_LABELS[m.score] ?? 'neutro');
    const avg = moods.reduce((s, m) => s + m.score, 0) / moods.length;
    parts.push(
      `Ánimo reciente (más nuevo primero): ${recent.join(', ')}. Promedio últimos registros: ${avg.toFixed(1)}/5.`,
    );
  }

  if (parts.length === 0) return '';

  return `\n\n# Contexto del usuario (úsalo con tacto, solo si ayuda)\n${parts.join('\n')}`;
}
