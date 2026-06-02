'use client';

import { useState, useEffect } from 'react';
import BreathingTimer from '@/components/bienestar/breathing-timer';

const MOOD_OPTIONS = [
  { emoji: '😁', label: 'Genial',   score: 5, color: 'bg-emerald-400' },
  { emoji: '😊', label: 'Bien',     score: 4, color: 'bg-green-400'   },
  { emoji: '😐', label: 'Normal',   score: 3, color: 'bg-amber-400'   },
  { emoji: '😔', label: 'Bajo',     score: 2, color: 'bg-orange-400'  },
  { emoji: '😰', label: 'Ansioso',  score: 1, color: 'bg-red-400'     },
];

const MOOD_TIPS: Record<number, string> = {
  5: '¡Excelente! Aprovecha esta energía para las tareas que más te cuestan.',
  4: 'Vas bien. Revisar tu agenda ahora puede ser muy productivo.',
  3: 'Un día normal también cuenta. Un ciclo de respiración puede ayudarte a enfocarte.',
  2: 'Está bien tener días difíciles. Empieza con algo pequeño y celebra cada avance.',
  1: 'Respira. La técnica 4-4-6 que tienes abajo está hecha para momentos como este.',
};

interface MoodEntry { id: string; score: number; createdAt: string }

export default function BienestarPage() {
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [history, setHistory]     = useState<MoodEntry[]>([]);
  const [note, setNote]           = useState('');
  const [showNote, setShowNote]   = useState(false);

  useEffect(() => {
    fetch('/api/mood')
      .then(r => r.ok ? r.json() : [])
      .then(data => setHistory(Array.isArray(data) ? data : []));
  }, [saved]);

  const handleMoodSelect = async (score: number) => {
    setSelectedScore(score);
    setSaved(false);
    setShowNote(false);
  };

  const handleSaveMood = async () => {
    if (!selectedScore) return;
    setSaving(true);
    try {
      const res = await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: selectedScore, note: note.trim() || null }),
      });
      if (res.ok) {
        setSaved(true);
        setNote('');
        setShowNote(false);
      }
    } finally {
      setSaving(false);
    }
  };

  // Build 7-day grid (oldest → newest)
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return d.toDateString();
  });

  const lastPerDay = days.map(day => {
    const entries = history.filter(m => new Date(m.createdAt).toDateString() === day);
    return entries.length > 0 ? entries[entries.length - 1] : null;
  });

  const dayLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  return (
    <div className="px-4 py-4 space-y-4">
      <header>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Bienestar</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Cuida tu salud mental</p>
      </header>

      {/* Selector de ánimo */}
      <div className="bg-gradient-to-r from-violet-400 to-violet-500 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium">¿Cómo te sientes?</h2>
          <svg className="w-5 h-5 text-white/70" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </div>

        <div className="flex justify-between mb-3">
          {MOOD_OPTIONS.map(opt => (
            <button
              key={opt.score}
              onClick={() => handleMoodSelect(opt.score)}
              aria-label={opt.label}
              aria-pressed={selectedScore === opt.score}
              className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all ${
                selectedScore === opt.score ? 'bg-white/30 scale-110 shadow-sm' : 'hover:bg-white/10'
              }`}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <span className="text-xs font-medium">{opt.label}</span>
            </button>
          ))}
        </div>

        {selectedScore && !saved && (
          <div className="space-y-2">
            {showNote ? (
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="¿Quieres añadir una nota? (opcional)"
                rows={2}
                className="w-full px-3 py-2 text-sm bg-white/20 placeholder:text-white/60 text-white rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-white/40"
              />
            ) : (
              <button
                onClick={() => setShowNote(true)}
                className="text-xs text-white/70 underline hover:text-white transition-colors"
              >
                + Añadir nota
              </button>
            )}
            <button
              onClick={handleSaveMood}
              disabled={saving}
              className="w-full py-2 rounded-full text-sm font-medium bg-white text-violet-600 hover:bg-white/90 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Guardando...' : 'Guardar estado de ánimo'}
            </button>
          </div>
        )}

        {saved && (
          <div className="flex items-center gap-2 bg-white/20 rounded-xl px-3 py-2">
            <svg className="w-4 h-4 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium">¡Ánimo registrado! 💜</span>
          </div>
        )}
      </div>

      {/* Tip contextual */}
      {selectedScore && (
        <div className="bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/50 rounded-2xl p-4">
          <p className="text-sm text-violet-700 dark:text-violet-300">
            💡 {MOOD_TIPS[selectedScore]}
          </p>
        </div>
      )}

      {/* Respiración */}
      <BreathingTimer />

      {/* Historial de ánimo — últimos 7 días */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">Ánimo esta semana</h3>
        <div className="flex justify-between items-end gap-1">
          {lastPerDay.map((entry, i) => {
            const opt = entry ? MOOD_OPTIONS.find(o => o.score === entry.score) : null;
            return (
              <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                <span className="text-lg">{opt ? opt.emoji : '○'}</span>
                <div
                  className={`w-full rounded-full ${opt ? opt.color : 'bg-gray-200 dark:bg-gray-700'}`}
                  style={{ height: opt ? `${(opt.score / 5) * 32 + 8}px` : '8px' }}
                  title={opt ? `${opt.label}` : 'Sin registro'}
                />
                <span className="text-xs text-gray-400 dark:text-gray-500">{dayLabels[i]}</span>
              </div>
            );
          })}
        </div>
        {history.length === 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-3">
            Aún no hay registros esta semana. ¡Selecciona cómo te sientes arriba!
          </p>
        )}
      </div>

      {/* Tips de bienestar */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">Tips para el TDAH</h3>
        <div className="space-y-2">
          {[
            { icon: '⏱️', tip: 'Trabaja en bloques de 25 min y descansa 5 min (técnica Pomodoro).' },
            { icon: '📝', tip: 'Divide cada tarea grande en 3 pasos de máximo 15 minutos.' },
            { icon: '🎯', tip: 'Elige solo 3 tareas prioritarias para hoy. Nada más.' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="text-base mt-0.5">{item.icon}</span>
              <p className="text-sm text-gray-600 dark:text-gray-300">{item.tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
