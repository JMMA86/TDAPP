const groups = [
  {
    id: '1',
    name: 'TDAH Jovenes Adultos',
    description: 'Espacio seguro para compartir experiencias y estrategias',
    members: 1247,
    active: 'Hace 2h',
    joined: true,
  },
  {
    id: '2',
    name: 'Estrategias de Organizacion',
    description: 'Tips y trucos para mantenerse organizado',
    members: 856,
    active: 'Hace 5h',
    joined: false,
  },
  {
    id: '3',
    name: 'Padres de Ninos Neurodivergentes',
    description: 'Apoyo para familias con hijos neurodivergentes',
    members: 432,
    active: 'Hace 1d',
    joined: true,
  },
];

export default function ComunidadPage() {
  return (
    <div className="px-4 py-4 space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Comunidad</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Conecta y aprende junto a otros</p>
        </div>
        <button className="p-2 text-violet-500 hover:text-violet-600 transition-colors" aria-label="Explorar grupos">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <path d="M20 8v6M23 11h-6" />
          </svg>
        </button>
      </header>

      <div className="bg-gradient-to-r from-violet-400 to-violet-500 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium">Tu comunidad</h2>
          <svg className="w-5 h-5 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
          </svg>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-2xl font-bold">{groups.length}</p>
            <p className="text-xs text-white/70">Grupos</p>
          </div>
          <div>
            <p className="text-2xl font-bold">8</p>
            <p className="text-xs text-white/70">Conexiones</p>
          </div>
          <div>
            <p className="text-2xl font-bold">12</p>
            <p className="text-xs text-white/70">Conversaciones</p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Grupos de apoyo</h2>
          <button className="text-sm font-medium text-violet-500 hover:text-violet-600 transition-colors inline-flex items-center gap-1">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <path d="M20 8v6M23 11h-6" />
            </svg>
            Explorar
          </button>
        </div>
        <div className="space-y-3">
          {groups.map((group) => (
            <div key={group.id} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{group.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{group.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {group.members.toLocaleString()} miembros
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">&middot;</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      Actividad: {group.active}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 ml-3">
                  {group.joined && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                      Miembro
                    </span>
                  )}
                  <button
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      group.joined
                        ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        : 'bg-violet-500 text-white hover:bg-violet-600'
                    }`}
                  >
                    {group.joined ? 'Unido' : 'Unirse'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
