'use client';

import { useState, useEffect } from 'react';
import SkeletonTaskCard from './skeleton-task-card';

type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
  orden: number;
}

interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  subTasks?: SubTask[];
}

interface TaskCardProps {
  task: Task;
  onSplitWithAI?: (taskId: string) => void;
  onStatusChange?: (taskId: string, newStatus: string) => void;
  onSubTaskToggle?: (subTaskId: string, isCompleted: boolean) => void;
  onDelete?: (taskId: string) => void;
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

export default function TaskCard({
  task,
  onSplitWithAI,
  onStatusChange,
  onSubTaskToggle,
  onDelete,
  isSplitting = false,
}: TaskCardProps) {
  const isCompleted = task.status === 'COMPLETED';
  const [showSubtasks, setShowSubtasks] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!showDeleteConfirm) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowDeleteConfirm(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showDeleteConfirm]);

  if (isSplitting) {
    return <SkeletonTaskCard />;
  }

  const status = statusConfig[task.status];
  const priority = priorityConfig[task.priority];

  const handleCheckboxClick = () => {
    const newStatus = isCompleted ? 'PENDING' : 'COMPLETED';
    onStatusChange?.(task.id, newStatus);
  };

  const handleSplit = () => {
    onSplitWithAI?.(task.id);
  };

  return (
    <>
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setShowDeleteConfirm(false)}
            aria-hidden="true"
          />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800">¿Eliminar esta tarea?</h3>
            <p className="mt-1 text-sm text-gray-500 truncate">{task.title}</p>
            <p className="mt-2 text-sm text-gray-500">Esta acción no se puede deshacer</p>
            <div className="flex gap-3 mt-5">
              <button
                autoFocus
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 px-4 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDelete?.(task.id);
                }}
                className="flex-1 py-2.5 px-4 rounded-full text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    
    <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-4 transition-shadow hover:shadow-md">
      {/* Botón eliminar */}
      <button
        onClick={() => setShowDeleteConfirm(true)}
        aria-label="Eliminar tarea"
        className="absolute top-3 right-3 p-1 text-red-400 hover:text-red-600 transition-colors"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" />
          <path d="M10 11v6M14 11v6" />
        </svg>
      </button>

      <div className="flex items-start gap-3">
        {/* Checkbox circular */}
        <button
          onClick={handleCheckboxClick}
          aria-label={isCompleted ? 'Marcar como pendiente' : 'Marcar como completada'}
          className={[
            'w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors mt-0.5',
            isCompleted
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 hover:border-violet-400',
          ].join(' ')}
        >
          {isCompleted && (
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
              isCompleted ? 'text-gray-400 line-through' : 'text-gray-800',
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

      {/* Lista de subtareas (cuando ya fueron generadas) */}
      {task.subTasks && task.subTasks.length > 0 && (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <button
            onClick={() => setShowSubtasks((prev) => !prev)}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform ${showSubtasks ? 'rotate-0' : '-rotate-90'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            <span>{task.subTasks.length} pasos</span>
          </button>
          {showSubtasks && (
            <ul className="mt-2 space-y-1.5">
              {task.subTasks.map((sub) => (
                <li key={sub.id} className="flex items-start gap-2 text-sm text-gray-600">
                  <button
                    onClick={() => onSubTaskToggle?.(sub.id, !sub.isCompleted)}
                    aria-label={sub.isCompleted ? 'Desmarcar paso' : 'Marcar paso como completado'}
                    className={[
                      'mt-0.5 w-4 h-4 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-colors',
                      sub.isCompleted
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300 hover:border-violet-400',
                    ].join(' ')}
                  >
                    {sub.isCompleted && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <span className={sub.isCompleted ? 'line-through text-gray-400' : ''}>{sub.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Botón "Dividir con IA" — solo si no tiene subtareas aún */}
      {task.status !== 'COMPLETED' &&
        task.status !== 'ABANDONED' &&
        (!task.subTasks || task.subTasks.length === 0) && (
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
    </>
  );
}
