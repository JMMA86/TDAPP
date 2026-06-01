'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  taskType: string;
  subTasks?: { id: string; title: string; isCompleted: boolean; orden: number; difficulty: string; estimatedMinutes: number }[];
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tasks?userId=demo-user')
      .then((r) => r.json())
      .then((data) => {
        setTasks(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const activeTasks = tasks.filter((t) => t.status !== 'COMPLETED' && t.status !== 'ABANDONED');
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED');
  const totalSteps = tasks.reduce((sum, t) => sum + (t.subTasks?.length || 0), 0);
  const completedSteps = tasks.reduce(
    (sum, t) => sum + (t.subTasks?.filter((s) => s.isCompleted).length || 0),
    0,
  );
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <div className="px-4 py-4 space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Hola, Alex!</h1>
          <p className="text-sm text-gray-500">Como te sientes hoy?</p>
        </div>
        <button
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Configuracion"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        </button>
      </header>

      <div className="bg-gradient-to-r from-violet-400 to-violet-500 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium">Estado de animo</h2>
          <svg className="w-5 h-5 text-white/70" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </div>
        <div className="flex justify-between">
          {['😊', '😐', '😔', '😰', '😴'].map((emoji) => (
            <button
              key={emoji}
              className="text-2xl hover:scale-125 transition-transform active:scale-95"
              aria-label="Registrar estado de animo"
            >
              {emoji}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-white/70">Toca para registrar como te sientes ahora</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/bienestar"
          className="bg-gradient-to-r from-sky-300 to-sky-400 rounded-2xl p-4 text-white hover:shadow-md transition-shadow"
        >
          <svg className="w-7 h-7 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2" />
          </svg>
          <p className="text-sm font-semibold">Respira</p>
          <p className="text-xs text-white/70">2 min</p>
        </Link>
        <button
          onClick={() => {
            const evt = new CustomEvent('open-add-task-modal');
            window.dispatchEvent(evt);
          }}
          className="bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-2xl p-4 text-white hover:shadow-md transition-shadow text-left"
        >
          <svg className="w-7 h-7 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
          <p className="text-sm font-semibold">Micro-tarea</p>
          <p className="text-xs text-white/70">Facil</p>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <h2 className="text-sm font-semibold text-gray-800 mb-1">Progreso de hoy</h2>
        {loading ? (
          <p className="text-sm text-gray-400">Cargando...</p>
        ) : (
          <>
            <p className="text-xs text-emerald-600 font-medium mb-3">
              {completedTasks.length}/{tasks.length || 0} completadas
            </p>
            <ul className="space-y-2 mb-3">
              {tasks.slice(0, 4).map((task) => (
                <li key={task.id} className="flex items-center gap-3">
                  <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    task.status === 'COMPLETED' ? 'bg-green-500 border-green-500' : 'border-gray-300'
                  }`}>
                    {task.status === 'COMPLETED' && (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  <span className={`text-sm flex-1 truncate ${task.status === 'COMPLETED' ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                    {task.title}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    task.status === 'COMPLETED' ? 'bg-gray-100 text-gray-500' : 'bg-white border border-gray-200 text-gray-500'
                  }`}>
                    {task.status === 'COMPLETED' ? 'Completada' : 'Pendiente'}
                  </span>
                </li>
              ))}
              {tasks.length === 0 && (
                <p className="text-sm text-gray-400 py-2">No tienes tareas aun. Crea una!</p>
              )}
            </ul>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Progreso diario {progressPercent}%</p>
          </>
        )}
      </div>
    </div>
  );
}
