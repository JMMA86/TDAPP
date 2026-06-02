'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User { id: string; name: string | null; email: string }
interface Task { id: string; status: string }
interface MoodEntry { id: string; score: number; createdAt: string }

const BADGES = [
  { key: 'first_task',  emoji: '🌟', label: 'Primer paso',          condition: (t: Task[], _m: MoodEntry[]) => t.length > 0 },
  { key: 'streak_3',   emoji: '🔥', label: 'Racha de 3 días',       condition: (_t: Task[], m: MoodEntry[]) => activeDaysCount(m) >= 3 },
  { key: 'zen_mind',   emoji: '🧠', label: 'Mente zen',             condition: (_t: Task[], m: MoodEntry[]) => m.length >= 5 },
  { key: 'five_done',  emoji: '🏆', label: '5 tareas completadas',  condition: (t: Task[], _m: MoodEntry[]) => t.filter(x => x.status === 'COMPLETED').length >= 5 },
  { key: 'breath',     emoji: '🧘', label: 'Maestro respiración',   condition: (_t: Task[], m: MoodEntry[]) => m.length >= 10 },
  { key: 'constancy',  emoji: '💪', label: 'Constancia',            condition: (_t: Task[], m: MoodEntry[]) => activeDaysCount(m) >= 5 },
];

function activeDaysCount(moods: MoodEntry[]): number {
  return new Set(moods.map(m => new Date(m.createdAt).toDateString())).size;
}

export default function PerfilPage() {
  const [user, setUser]   = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then(r => r.json()),
      fetch('/api/tasks').then(r => r.ok ? r.json() : []),
      fetch('/api/mood').then(r => r.ok ? r.json() : []),
    ]).then(([auth, tasksData, moodsData]) => {
      if (auth.user) setUser(auth.user);
      setTasks(Array.isArray(tasksData) ? tasksData : []);
      setMoods(Array.isArray(moodsData) ? moodsData : []);
    }).finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
  const activeDays     = activeDaysCount(moods);
  const badges         = BADGES.map(b => ({ ...b, unlocked: b.condition(tasks, moods) }));
  const unlockedCount  = badges.filter(b => b.unlocked).length;

  const displayName    = user?.name || user?.email?.split('@')[0] || '';
  const avatarInitial  = (user?.name || user?.email || '?')[0].toUpperCase();

  const weekProgress = [
    { label: 'Tareas completadas',  current: completedTasks, total: Math.max(tasks.length, 1) },
    { label: 'Registros de ánimo',  current: moods.length,   total: 7, unit: '' },
    { label: 'Días activos',        current: activeDays,     total: 7 },
    { label: 'Logros desbloqueados',current: unlockedCount,  total: BADGES.length },
  ];

  return (
    <div className="px-4 py-4 space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Mi Perfil</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Personaliza tu experiencia</p>
        </div>
        <button
          onClick={handleLogout}
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          Cerrar sesión
        </button>
      </header>

      {/* Card de identidad */}
      <div className="bg-gradient-to-r from-violet-400 to-violet-500 rounded-2xl p-5 text-white">
        {loading ? (
          <div className="h-20 animate-pulse bg-white/20 rounded-xl" />
        ) : (
          <>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                {avatarInitial}
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold truncate">{displayName}</h2>
                <p className="text-xs text-white/70 truncate">{user?.email}</p>
              </div>
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 text-xs font-medium mb-4">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
              En crecimiento constante
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div><p className="text-2xl font-bold">{tasks.length}</p><p className="text-xs text-white/70">Tareas</p></div>
              <div><p className="text-2xl font-bold">{moods.length}</p><p className="text-xs text-white/70">Registros</p></div>
              <div><p className="text-2xl font-bold">{unlockedCount}</p><p className="text-xs text-white/70">Logros</p></div>
            </div>
          </>
        )}
      </div>

      {/* Progreso semanal */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
          </svg>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Resumen general</h3>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => <div key={i} className="h-7 animate-pulse bg-gray-100 dark:bg-gray-800 rounded" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {weekProgress.map((item) => {
              const pct = Math.min(100, Math.round((item.current / item.total) * 100));
              return (
                <div key={item.label}>
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-sm text-gray-600 dark:text-gray-300">{item.label}</span>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      {item.current}/{item.total}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Logros */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Logros</h3>
        </div>
        {loading ? (
          <div className="grid grid-cols-3 gap-3">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-16 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {badges.map(b => (
              <div
                key={b.key}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl text-center transition-opacity ${
                  b.unlocked ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-gray-50/50 dark:bg-gray-800/30 opacity-40'
                }`}
                title={b.unlocked ? 'Desbloqueado' : 'Bloqueado'}
              >
                <span className="text-2xl">{b.unlocked ? b.emoji : '🔒'}</span>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300 leading-tight">{b.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
