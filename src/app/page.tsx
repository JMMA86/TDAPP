'use client';

import { useState, useEffect } from 'react';
import AgendaContainer from '@/components/agenda/agenda-container';
import MoodTracker from '@/components/agenda/mood-tracker';
import TaskCard from '@/components/agenda/task-card';
import AddTaskModal from '@/components/agenda/add-task-modal';

type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
  orden: number;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  subTasks?: SubTask[];
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalKey, setModalKey] = useState(0);

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

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      fetchTasks();
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, status: newStatus }),
      });

      if (!res.ok) throw new Error('Error al actualizar estado');

      await fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar estado');
    }
  };

  const handleSubTaskToggle = async (subTaskId: string, isCompleted: boolean) => {
    try {
      const res = await fetch('/api/tasks/subtasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subTaskId, isCompleted }),
      });

      if (!res.ok) throw new Error('Error al actualizar el paso');

      await fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el paso');
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
        body: JSON.stringify({ userId: 'demo-user', taskId }),
      });

      if (!res.ok) throw new Error('Error al dividir tarea');

      const data = await res.json();
      if (data.aiFailed) {
        setError('La IA no está disponible ahora mismo. Asegúrate de que Ollama esté corriendo.');
      }

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
    <>
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
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-semibold text-gray-800">Mi Agenda</h1>
              <button
                onClick={() => { setShowAddModal(true); setModalKey((k) => k + 1); }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium rounded-full transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Agregar tarea
              </button>
            </div>
            <div className="space-y-3">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onSplitWithAI={handleSplitWithAI}
                  onStatusChange={handleStatusChange}
                  onSubTaskToggle={handleSubTaskToggle}
                  isSplitting={loadingTasks.has(task.id)}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </AgendaContainer>
      <AddTaskModal
        key={modalKey}
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onTaskCreated={fetchTasks}
      />
    </>
  );
}
