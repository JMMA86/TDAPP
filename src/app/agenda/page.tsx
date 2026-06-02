'use client';

import { useState, useEffect } from 'react';
import TaskCard from '@/components/agenda/task-card';
import AddTaskModal from '@/components/agenda/add-task-modal';

type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
type TaskType = 'MICRO_TASK' | 'REMINDER' | 'GOAL';

interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
  orden: number;
  difficulty: string;
  estimatedMinutes: number;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  taskType: TaskType;
  dueDate: string | null;
  createdAt: string;
  subTasks?: SubTask[];
}

const taskTypeTabs: { type: TaskType | 'ALL'; label: string; icon: string }[] = [
  { type: 'ALL', label: 'Todas', icon: '\uD83D\uDCCB' },
  { type: 'MICRO_TASK', label: 'Micro-tarea', icon: '\u26A1' },
  { type: 'REMINDER', label: 'Recordatorio', icon: '\uD83D\uDD50' },
  { type: 'GOAL', label: 'Meta', icon: '\uD83C\uDFAF' },
];

function getDayInfo() {
  const now = new Date();
  const days = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  return {
    dayName: days[now.getDay()],
    date: now.getDate(),
    month: months[now.getMonth()],
  };
}

export default function AgendaPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [taskTypeFilter, setTaskTypeFilter] = useState<TaskType | 'ALL'>('ALL');

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      if (!res.ok) throw new Error('Error al cargar tareas');
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
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
        body: JSON.stringify({ taskId }),
      });

      if (!res.ok) throw new Error('Error al dividir tarea');

      const data = await res.json();
      if (data.aiFailed) {
        setError('La IA no esta disponible ahora mismo. Asegurate de que Ollama este corriendo.');
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
      if (taskTypeFilter === 'ALL') return true;
      return t.taskType === taskTypeFilter;
    })
    .filter((t) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q));
    });

  const { dayName, date } = getDayInfo();
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
  const pendingTasks = tasks.filter((t) => t.status !== 'COMPLETED').length;

  return (
    <>
      <div className="px-4 py-4 space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Agenda</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Organiza tu dia</p>
          </div>
          <button
            onClick={() => { setShowAddModal(true); setModalKey((k) => k + 1); }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium rounded-full transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Agregar
          </button>
        </header>

        <div className="bg-gradient-to-r from-violet-400 to-violet-500 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium">
              Hoy, {dayName} {date}
            </h2>
            <svg className="w-5 h-5 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-2xl font-bold">{totalTasks}</p>
              <p className="text-xs text-white/70">Total</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{completedTasks}</p>
              <p className="text-xs text-white/70">Completadas</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingTasks}</p>
              <p className="text-xs text-white/70">Pendientes</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar tareas..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-800 transition-colors"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {taskTypeTabs.map((tab) => (
            <button
              key={tab.type}
              onClick={() => setTaskTypeFilter(tab.type)}
              className={`flex-shrink-0 inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                taskTypeFilter === tab.type
                  ? 'bg-white dark:bg-gray-800 shadow-sm text-violet-600'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <span className="text-xs">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">Cargando...</p>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-sm text-red-600 underline hover:text-red-800"
            >
              Reintentar
            </button>
          </div>
        ) : filteredTasks.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            {searchQuery ? 'No se encontraron tareas' : 'No tienes tareas de este tipo'}
          </p>
        ) : (
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
        )}
      </div>

      <button
        onClick={() => { setShowAddModal(true); setModalKey((k) => k + 1); }}
        className="fixed bottom-24 right-4 z-30 w-14 h-14 bg-violet-500 hover:bg-violet-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
        aria-label="Agregar tarea"
      >
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      <AddTaskModal
        key={modalKey}
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onTaskCreated={fetchTasks}
      />
    </>
  );
}
