export default function PerfilPage() {
  return (
    <div className="px-4 py-4 space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Mi Perfil</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Personaliza tu experiencia</p>
        </div>
      </header>

      <div className="bg-gradient-to-r from-violet-400 to-violet-500 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold text-white">
            A
          </div>
          <div>
            <h2 className="text-lg font-semibold">Alex Rivera</h2>
            <p className="text-xs text-white/70">Miembro desde Junio 2025</p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 text-xs font-medium">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
          En crecimiento constante
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4 text-center">
          <div>
            <p className="text-2xl font-bold">23</p>
            <p className="text-xs text-white/70">Tareas</p>
          </div>
          <div>
            <p className="text-2xl font-bold">12</p>
            <p className="text-xs text-white/70">Ejercicios</p>
          </div>
          <div>
            <p className="text-2xl font-bold">5</p>
            <p className="text-xs text-white/70">Logros</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Progreso semanal</h3>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Tareas completadas', current: 23, total: 30 },
            { label: 'Ejercicios bienestar', current: 12, total: 15 },
            { label: 'Dias activos', current: 5, total: 7 },
            { label: 'Tiempo mindfulness', current: 45, total: 60, unit: 'min' },
          ].map((item) => {
            const percent = Math.round((item.current / item.total) * 100);
            return (
              <div key={item.label}>
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{item.label}</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                    {item.current}{item.unit ? item.unit : ''}/{item.total}{item.unit ? item.unit : ''}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Logros</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { emoji: '\uD83C\uDF1F', label: 'Primer paso', unlocked: true },
            { emoji: '\uD83D\uDD25', label: 'Racha de 3 dias', unlocked: true },
            { emoji: '\uD83E\uDDE0', label: 'Mente zen', unlocked: false },
            { emoji: '\uD83C\uDFC6', label: '5 tareas completadas', unlocked: true },
            { emoji: '\uD83E\uDDD8', label: 'Maestro respiracion', unlocked: false },
            { emoji: '\uD83D\uDCAA', label: 'Constancia', unlocked: true },
          ].map((badge) => (
            <div
              key={badge.label}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl text-center ${
                badge.unlocked ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-gray-50/50 dark:bg-gray-800/30 opacity-50'
              }`}
            >
              <span className="text-2xl">{badge.unlocked ? badge.emoji : '\uD83D\uDD12'}</span>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300 leading-tight">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
