'use client';

import { useState } from 'react';
import SkeletonTaskCard from './skeleton-task-card';

type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
}

interface TaskCardProps {
  task: Task;
  onSplitWithAI?: (taskId: string) => void;
  isSplitting?: boolean;
}

const statusConfig: Record<TaskStatus, { label: string; dot: string; badge: string }> = {
  PENDING: { label: 'Pendiente', dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-600' },
  IN_PROGRESS: { label: 'En progreso', dot: 'bg-blue-400', badge: 'bg-blue-100 text-blue-700' },
  COMPLETED: { label: 'Completada', dot: 'bg-green-400', badge: 'bg-green-100 text-green-700' },
  ABANDONED: { label: 'Abandonada', dot: 'bg-red-400', badge: 'bg-red-100 text-red-700' },
};

const priorityConfig: Record<TaskPriority, { label: string; badge: string }> = {
  LOW: { label: 'Baja', badge: 'bg-gray-100 text-gray-600' },
  MEDIUM: { label: 'Media', badge: 'bg-blue-100 text-blue-700' },
  HIGH: { label: 'Alta', badge: 'bg-orange-100 text-orange-700' },
};

export default function TaskCard({ task, onSplitWithAI, isSplitting = false }: TaskCardProps) {
  const [completed, setCompleted] = useState(task.status === 'COMPLETED');

  if (isSplitting) {
    return <SkeletonTaskCard />;
  }

  const status = statusConfig[task.status];
  const priority = priorityConfig[task.priority];

  const handleSplit = () => {
    onSplitWithAI?.(task.id);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        {/* Checkbox circular */}
        <button
          onClick={() => setCompleted(!completed)}
          aria-label={completed ? 'Marcar como pendiente' : 'Marcar como completada'}
          className={[
            'w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors mt-0.5',
            completed
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 hover:border-violet-400',
          ].join(' ')}
        >
          {completed && (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          {/* Título */}
          <h3
            className={[
              'text-sm font-medium leading-snug line-clamp-2',
              completed ? 'text-gray-400 line-through' : 'text-gray-800',
            ].join(' ')}
          >
            {task.title}
          </h3>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {/* Badge de prioridad */}
            <span
              className={[
                'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                priority.badge,
              ].join(' ')}
            >
              {priority.label}
            </span>

            {/* Badge de estado con puntito */}
            <span
              className={[
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                status.badge,
              ].join(' ')}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
          </div>
        </div>
      </div>

      {/* Botón "Dividir con IA" */}
      {task.status !== 'COMPLETED' && task.status !== 'ABANDONED' && (
        <div className="mt-3">
          <button
            onClick={handleSplit}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium rounded-full transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
              />
            </svg>
            Dividir con IA
          </button>
        </div>
      )}
    </div>
  );
}
