'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

type Phase = 'inhale' | 'hold' | 'exhale';
type TimerState = 'idle' | 'running' | 'paused';

const phaseConfig: Record<Phase, { seconds: number; label: string; instruction: string }> = {
  inhale: { seconds: 4, label: 'Inhala', instruction: 'Inhala suavemente' },
  hold: { seconds: 4, label: 'Mantén', instruction: 'Manten' },
  exhale: { seconds: 6, label: 'Exhala', instruction: 'Exhala lentamente' },
};

const phaseOrder: Phase[] = ['inhale', 'hold', 'exhale'];

export default function BreathingTimer() {
  const [state, setState] = useState<TimerState>('idle');
  const [phase, setPhase] = useState<Phase>('inhale');
  const [countdown, setCountdown] = useState(4);
  const [cycle, setCycle] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds = phaseConfig.inhale.seconds + phaseConfig.hold.seconds + phaseConfig.exhale.seconds;
  const completedPhaseSeconds =
    phaseOrder.indexOf(phase) === 0
      ? phaseConfig.inhale.seconds - countdown
      : phaseOrder.indexOf(phase) === 1
        ? phaseConfig.inhale.seconds + (phaseConfig.hold.seconds - countdown)
        : phaseConfig.inhale.seconds + phaseConfig.hold.seconds + (phaseConfig.exhale.seconds - countdown);

  const progressPercent = Math.round((completedPhaseSeconds / totalSeconds) * 100);
  const currentConfig = phaseConfig[phase];

  const tick = useCallback(() => {
    setCountdown((prev) => {
      if (prev <= 1) {
        setPhase((currentPhase) => {
          const idx = phaseOrder.indexOf(currentPhase);
          if (idx < phaseOrder.length - 1) {
            const next = phaseOrder[idx + 1];
            setCountdown(phaseConfig[next].seconds);
            return next;
          }
          setCycle((c) => c + 1);
          setCountdown(phaseConfig.inhale.seconds);
          return 'inhale';
        });
        return prev;
      }
      return prev - 1;
    });
  }, []);

  useEffect(() => {
    if (state === 'running') {
      intervalRef.current = setInterval(tick, 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state, tick]);

  const handleStartPause = () => {
    if (state === 'idle') {
      setState('running');
    } else if (state === 'running') {
      setState('paused');
    } else {
      setState('running');
    }
  };

  const handleReset = () => {
    setState('idle');
    setPhase('inhale');
    setCountdown(4);
    setCycle(1);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return (
    <div className="bg-gradient-to-r from-sky-300 to-sky-400 rounded-2xl p-5 text-white">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2" />
        </svg>
        <h3 className="text-sm font-semibold">Respiracion 4-4-6</h3>
      </div>

      <div className="flex flex-col items-center">
        <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center mb-3">
          <span className="text-5xl font-bold text-white">{countdown}</span>
        </div>

        <p className="text-sm font-medium mb-1">
          {currentConfig.instruction}
        </p>
        <p className="text-xs text-white/70 mb-3">
          Ciclo {cycle} - Fase {currentConfig.label.toLowerCase()}
        </p>

        <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-white rounded-full transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleStartPause}
          className="flex-1 py-2.5 px-4 rounded-full text-sm font-medium bg-white/20 hover:bg-white/30 text-white transition-colors"
        >
          {state === 'running' ? 'Pausar' : state === 'paused' ? 'Reanudar' : 'Comenzar'}
        </button>
        <button
          onClick={handleReset}
          className="flex-1 py-2.5 px-4 rounded-full text-sm font-medium bg-white/20 hover:bg-white/30 text-white transition-colors"
        >
          Reiniciar
        </button>
      </div>
    </div>
  );
}
