'use client';

import { useState } from 'react';
import BreathingTimer from '@/components/bienestar/breathing-timer';

const moodOptions = [
  { emoji: '\uD83D\uDE01', label: 'Genial', value: 5 },
  { emoji: '\uD83D\uDE0A', label: 'Bien', value: 4 },
  { emoji: '\uD83D\uDE10', label: 'Normal', value: 3 },
  { emoji: '\uD83D\uDE14', label: 'Bajo', value: 2 },
  { emoji: '\uD83D\uDE30', label: 'Ansioso', value: 1 },
];

export default function BienestarPage() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  return (
    <div className="px-4 py-4 space-y-4">
      <header>
        <h1 className="text-xl font-semibold text-gray-800">Bienestar</h1>
        <p className="text-sm text-gray-500">Cuida tu salud mental</p>
      </header>

      <div className="bg-gradient-to-r from-violet-400 to-violet-500 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium">Como te sientes?</h2>
          <svg className="w-5 h-5 text-white/70" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </div>
        <div className="flex justify-between">
          {moodOptions.map((mood) => (
            <button
              key={mood.value}
              onClick={() => setSelectedMood(mood.value)}
              className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all ${
                selectedMood === mood.value
                  ? 'bg-white/30 scale-110 shadow-sm'
                  : 'hover:bg-white/10'
              }`}
            >
              <span className="text-2xl">{mood.emoji}</span>
              <span className="text-xs font-medium">{mood.label}</span>
            </button>
          ))}
        </div>
      </div>

      <BreathingTimer />
    </div>
  );
}
