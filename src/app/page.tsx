'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/theme-toggle';

const MOOD_OPTIONS = [
  { emoji: '😁', label: 'Genial',  score: 5 },
  { emoji: '😊', label: 'Bien',    score: 4 },
  { emoji: '😐', label: 'Normal',  score: 3 },
  { emoji: '😔', label: 'Bajo',    score: 2 },
  { emoji: '😰', label: 'Ansioso', score: 1 },
];

const TIPS = [
  'Divide una tarea grande en 3 pasos de 10 minutos.',
  'Antes de empezar, escribe la ÚNICA cosa más importante del día.',
  'Una pausa de respiración de 2 minutos recarga tu concentración.',
  'Celebra cada pequeño avance. El cerebro aprende del éxito.',
  'Silencia notificaciones 25 minutos. Solo necesitas un bloque.',
];

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  taskType: string;
  subTasks?: { id: string; title: string; isCompleted: boolean; orden: number }[];
}

export default function Home() {
  const [userName, setUserName] = useState('');
  const [tasks, setTasks]       = useState<Task[]>([]);
  const [loading, setLoading]   = useState(true);
  const [todayMood, setTodayMood] = useState<number | null>(null);
  const [savingMood, setSavingMood] = useState(false);
  const [moodSaved, setMoodSaved]   = useState(false);
  const tipOfDay = TIPS[new Date().getDay() % TIPS.length];

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => { if (data.user) setUserName(data.user.name || data.user.email?.split('@')[0] || ''); });

    fetch('/api/tasks')
      .then(r => r.ok ? r.json() : [])
      .then(data => { setTasks(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));

    // Check if mood already registered today
    fetch('/api/mood')
      .then(r => r.ok ? r.json() : [])
      .then((entries: { score: number; createdAt: string }[]) => {
        const today = new Date().toDateString();
        const todayEntry = entries.filter(e => new Date(e.createdAt).toDateString() === today).pop();
        if (todayEntry) { setTodayMood(todayEntry.score); setMoodSaved(true); }
      });
  }, []);

  const handleMoodSelect = async (score: number) => {
    if (moodSaved || savingMood) return;
    setSavingMood(true);
    setTodayMood(score);
    try {
      const res = await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score }),
      });
      if (res.ok) setMoodSaved(true);
    } finally {
      setSavingMood(false);
    }
  };

  const pendingTasks    = tasks.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS');
  const completedTasks  = tasks.filter(t => t.status === 'COMPLETED');
  const totalSteps      = tasks.reduce((s, t) => s + (t.subTasks?.length || 0), 0);
  const completedSteps  = tasks.reduce((s, t) => s + (t.subTasks?.filter(x => x.isCompleted).length || 0), 0);
  const progressPct     = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  const selectedMoodOpt = MOOD_OPTIONS.find(o => o.score === todayMood);

  return (
    <div className="px-4 py-4 space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            ¡Hola{userName ? `, ${userName}` : ''}!
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {moodSaved && selectedMoodOpt
              ? `Te sientes ${selectedMoodOpt.label.toLowerCase()} hoy ${selectedMoodOpt.emoji}`
              : '¿Cómo te sientes hoy?'}
          </p>
        </div>
        <ThemeToggle className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors" />
      </header>

      {/* Mood card */}
      <div className="bg-gradient-to-r from-violet-400 to-violet-500 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium">Estado de ánimo</h2>
          <svg className="w-5 h-5 text-white/70" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </div>
        <div className="flex justify-between">
          {MOOD_OPTIONS.map(opt => (
            <button
              key={opt.score}
              onClick={() => handleMoodSelect(opt.score)}
              aria-label={opt.label}
              disabled={moodSaved || savingMood}
              className={`text-2xl transition-all ${
                todayMood === opt.score
                  ? 'scale-125 drop-shadow-lg'
                  : moodSaved ? 'opacity-40' : 'hover:scale-125 active:scale-95'
              } disabled:cursor-default`}
            >
              {opt.emoji}
            </button>
          ))}
        </div>
        {moodSaved ? (
          <p className="mt-2 text-xs text-white/80">✓ Ánimo registrado hoy</p>
        ) : (
          <p className="mt-2 text-xs text-white/70">Toca para registrar cómo te sientes ahora</p>
        )}
      </div>

      {/* Accesos rápidos */}
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
        <Link
          href="/agenda"
          className="bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-2xl p-4 text-white hover:shadow-md transition-shadow"
        >
          <svg className="w-7 h-7 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
          </svg>
          <p className="text-sm font-semibold">Mi Agenda</p>
          <p className="text-xs text-white/70">{pendingTasks.length} pendientes</p>
        </Link>
      </div>

      {/* Resumen de tareas */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Progreso de hoy</h2>
          {!loading && tasks.length > 0 && (
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {completedTasks.length}/{tasks.length} completadas
            </span>
          )}
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-8 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg" />)}
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-2">No tienes tareas aún.</p>
            <Link href="/agenda" className="text-sm text-violet-600 font-medium hover:underline">
              Crear mi primera tarea →
            </Link>
          </div>
        ) : (
          <>
            <ul className="space-y-2 mb-3">
              {tasks.slice(0, 4).map(task => (
                <li key={task.id} className="flex items-center gap-3">
                  <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    task.status === 'COMPLETED' ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {task.status === 'COMPLETED' && (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  <span className={`text-sm flex-1 truncate ${task.status === 'COMPLETED' ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-700 dark:text-gray-200'}`}>
                    {task.title}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                    task.status === 'COMPLETED'
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'
                  }`}>
                    {task.status === 'COMPLETED' ? 'Hecha' : 'Pendiente'}
                  </span>
                </li>
              ))}
            </ul>
            {tasks.length > 4 && (
              <Link href="/agenda" className="text-xs text-violet-500 hover:underline">
                Ver {tasks.length - 4} más en Agenda →
              </Link>
            )}
            {totalSteps > 0 && (
              <>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-3">
                  <div className="h-full bg-violet-500 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Pasos completados {progressPct}% · {completedSteps}/{totalSteps}
                </p>
              </>
            )}
          </>
        )}
      </div>

      {/* Stats rápidas */}
      {!loading && tasks.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Pendientes', value: pendingTasks.length, color: 'text-violet-600 dark:text-violet-400' },
            { label: 'Completadas', value: completedTasks.length, color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Total', value: tasks.length, color: 'text-gray-600 dark:text-gray-300' },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tip del día */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40 rounded-2xl p-4">
        <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">💡 Tip del día</p>
        <p className="text-sm text-amber-800 dark:text-amber-200">{tipOfDay}</p>
      </div>
    </div>
  );
}
