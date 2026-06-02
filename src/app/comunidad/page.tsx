'use client';

import { useState } from 'react';

const INITIAL_GROUPS = [
  {
    id: '1',
    name: 'TDAH Jóvenes Adultos',
    description: 'Espacio seguro para compartir experiencias y estrategias de vida con TDAH.',
    members: 1247,
    active: 'Hace 2h',
    joined: true,
    category: 'Apoyo',
  },
  {
    id: '2',
    name: 'Estrategias de Organización',
    description: 'Tips y trucos probados para mantenerse organizado cuando tu cerebro no quiere.',
    members: 856,
    active: 'Hace 5h',
    joined: false,
    category: 'Productividad',
  },
  {
    id: '3',
    name: 'Padres de Niños Neurodivergentes',
    description: 'Apoyo y recursos para familias con hijos neurodivergentes.',
    members: 432,
    active: 'Hace 1d',
    joined: true,
    category: 'Familia',
  },
  {
    id: '4',
    name: 'Ansiedad y Concentración',
    description: 'Para quienes lidian con ansiedad y buscan técnicas de enfoque.',
    members: 674,
    active: 'Hace 3h',
    joined: false,
    category: 'Bienestar',
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Apoyo:         'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  Productividad: 'bg-blue-100   text-blue-700   dark:bg-blue-900/40   dark:text-blue-300',
  Familia:       'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  Bienestar:     'bg-amber-100  text-amber-700  dark:bg-amber-900/40  dark:text-amber-300',
};

export default function ComunidadPage() {
  const [groups, setGroups]   = useState(INITIAL_GROUPS);
  const [toast, setToast]     = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const toggleJoin = (id: string) => {
    setGroups(prev => prev.map(g =>
      g.id === id ? { ...g, joined: !g.joined, members: g.joined ? g.members - 1 : g.members + 1 } : g
    ));
  };

  const joinedCount = groups.filter(g => g.joined).length;

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-800 text-white text-sm px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 max-w-xs text-center">
          <span>🚀</span> {toast}
        </div>
      )}

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Comunidad</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Conecta y aprende junto a otros</p>
        </div>
        <button
          onClick={() => showToast('Creación de grupos estará disponible pronto')}
          aria-label="Crear nuevo grupo"
          className="w-9 h-9 flex items-center justify-center rounded-full bg-violet-500 hover:bg-violet-600 text-white transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </header>

      {/* Stats */}
      <div className="bg-gradient-to-r from-violet-400 to-violet-500 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium">Tu comunidad</h2>
          <svg className="w-5 h-5 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /><circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
          </svg>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div><p className="text-2xl font-bold">{joinedCount}</p><p className="text-xs text-white/70">Grupos</p></div>
          <div><p className="text-2xl font-bold">{groups.reduce((s, g) => g.joined ? s + 1 : s, 0) * 3}</p><p className="text-xs text-white/70">Conexiones</p></div>
          <div><p className="text-2xl font-bold">{joinedCount * 4}</p><p className="text-xs text-white/70">Mensajes</p></div>
        </div>
      </div>

      {/* Lista de grupos */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Grupos de apoyo</h2>
          <button
            onClick={() => showToast('Explorar más grupos estará disponible pronto')}
            className="text-sm font-medium text-violet-500 hover:text-violet-600 transition-colors inline-flex items-center gap-1"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            Explorar
          </button>
        </div>

        <div className="space-y-3">
          {groups.map(group => (
            <div key={group.id} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <button
                    className="flex-1 min-w-0 text-left"
                    onClick={() => setExpanded(expanded === group.id ? null : group.id)}
                    aria-expanded={expanded === group.id}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{group.name}</h3>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0 ${CATEGORY_COLORS[group.category]}`}>
                        {group.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{group.description}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {group.members.toLocaleString()} miembros
                      </span>
                      <span className="text-xs text-gray-300 dark:text-gray-600">·</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">Activo {group.active}</span>
                    </div>
                  </button>

                  <div className="flex flex-col items-end gap-1.5 ml-3 shrink-0">
                    {group.joined && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                        Miembro
                      </span>
                    )}
                    <button
                      onClick={() => toggleJoin(group.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        group.joined
                          ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                          : 'bg-violet-500 text-white hover:bg-violet-600'
                      }`}
                    >
                      {group.joined ? 'Salir' : 'Unirse'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Detalle expandido */}
              {expanded === group.id && (
                <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3 bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{group.description}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => showToast('El chat de grupos estará disponible pronto')}
                      className="flex-1 py-2 rounded-xl text-xs font-medium bg-violet-500 text-white hover:bg-violet-600 transition-colors"
                    >
                      💬 Ver chat
                    </button>
                    <button
                      onClick={() => showToast('Los posts del grupo estarán disponibles pronto')}
                      className="flex-1 py-2 rounded-xl text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      📌 Posts
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
          Chat y posts de grupo estarán disponibles en la próxima versión
        </p>
      </div>
    </div>
  );
}
