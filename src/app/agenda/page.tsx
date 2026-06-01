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
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ACTIVE');

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

  const handleDelete = async (taskId: string) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      });

      if (!res.ok) throw new Error('Error al eliminar tarea');

      await fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar tarea');
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

  const filteredTasks = tasks
    .filter((t) => {
      if (filter === 'ACTIVE') return t.status !== 'COMPLETED' && t.status !== 'ABANDONED';
      if (filter === 'COMPLETED') return t.status === 'COMPLETED';
      return true;
    })
    .filter((t) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q));
    });

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

            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar tareas..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none text-sm text-gray-700 placeholder-gray-400 transition-colors"
              />
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setFilter('ACTIVE')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filter === 'ACTIVE'
                    ? 'bg-violet-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Activas
              </button>
              <button
                onClick={() => setFilter('COMPLETED')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filter === 'COMPLETED'
                    ? 'bg-violet-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Completadas
              </button>
              <button
                onClick={() => setFilter('ALL')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filter === 'ALL'
                    ? 'bg-violet-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Todas
              </button>
            </div>

            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onSplitWithAI={handleSplitWithAI}
                  onStatusChange={handleStatusChange}
                  onSubTaskToggle={handleSubTaskToggle}
                  onDelete={handleDelete}
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
