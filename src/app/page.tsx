'use client';

import { useState, useEffect } from 'react';
import AgendaContainer from '@/components/agenda/agenda-container';
import MoodTracker from '@/components/agenda/mood-tracker';
import TaskCard from '@/components/agenda/task-card';

type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks?userId=demo-user');
      if (!res.ok) throw new Error('Error al cargar tareas');
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSplitWithAI = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    setLoadingTasks((prev) => new Set(prev).add(taskId));

    try {
      const res = await fetch('/api/tasks/split', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'demo-user', taskTitle: task.title }),
      });

      if (!res.ok) throw new Error('Error al dividir tarea');

      await fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al dividir tarea');
    } finally {
      setLoadingTasks((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    }
  };

  return (
    <AgendaContainer>
      {isLoading ? (
        <p className="text-center text-gray-500 py-8">Cargando...</p>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-700 text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-600 underline hover:text-red-800"
          >
            Reintentar
          </button>
        </div>
      ) : tasks.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No tienes tareas pendientes</p>
      ) : (
        <>
          <MoodTracker />
          <section>
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">Mi Agenda</h1>
            <div className="space-y-3">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onSplitWithAI={handleSplitWithAI}
                  isSplitting={loadingTasks.has(task.id)}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </AgendaContainer>
  );
}
