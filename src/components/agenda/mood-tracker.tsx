'use client';

import { useState } from 'react';

const moods = [
  { emoji: '😫', score: 1, label: 'Muy mal' },
  { emoji: '😟', score: 2, label: 'Mal' },
  { emoji: '😐', score: 3, label: 'Regular' },
  { emoji: '🙂', score: 4, label: 'Bien' },
  { emoji: '😄', score: 5, label: 'Muy bien' },
];

interface MoodTrackerProps {
  onMoodSelect?: (score: number) => void;
  selectedMood?: number | null;
}

export default function MoodTracker({ onMoodSelect, selectedMood: externalMood }: MoodTrackerProps) {
  const [internalMood, setInternalMood] = useState<number | null>(null);

  const selected = externalMood !== undefined ? externalMood : internalMood;

  const handleSelect = (score: number) => {
    setInternalMood(score);
    onMoodSelect?.(score);
  };

  return (
    <section aria-label="¿Cómo te sientes?" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-sm font-medium text-gray-500 mb-4 text-center">
        ¿Cómo te sientes hoy?
      </h2>
      <div role="radiogroup" aria-label="Selecciona tu estado de ánimo" className="flex justify-center gap-3">
        {moods.map((mood) => (
          <button
            key={mood.score}
            role="radio"
            aria-checked={selected === mood.score}
            aria-label={mood.label}
            onClick={() => handleSelect(mood.score)}
            className={[
              'w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all duration-200',
              'hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2',
              selected === mood.score
                ? 'scale-110 ring-2 ring-violet-400 bg-violet-50'
                : 'bg-gray-50 hover:bg-violet-50',
            ].join(' ')}
          >
            <span className="leading-none">{mood.emoji}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
