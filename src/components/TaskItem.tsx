import React from 'react';
import { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  isAdmin?: boolean;
}

const priorityStyles: { [key in Task['priority']]: string } = {
  high: 'border-red-500',
  medium: 'border-yellow-500',
  low: 'border-cyan-500',
};

const priorityBadgeStyles: { [key in Task['priority']]: string } = {
  high: 'bg-red-500/80 text-white',
  medium: 'bg-yellow-500/80 text-zinc-900',
  low: 'bg-cyan-500/80 text-white',
};

const priorityText: { [key in Task['priority']]: string } = {
    high: 'أولوية عالية',
    medium: 'أولوية متوسطة',
    low: 'أولوية منخفضة',
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete, isAdmin = false }) => {
  const isPastDueAndIncomplete = task.dueDate && !task.completed && new Date(task.dueDate) < new Date();
  
  const taskTextColor = task.completed 
    ? 'text-zinc-500 dark:text-zinc-400' 
    : isPastDueAndIncomplete 
      ? 'text-red-800 dark:text-red-300' 
      : 'text-zinc-800 dark:text-zinc-100';

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };
  
  const lockedBg = isPastDueAndIncomplete ? 'bg-red-200/30 dark:bg-red-900/30 hover:bg-red-200/30 dark:hover:bg-red-900/30' : 'bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50';

  return (
    <li className={`flex items-center p-3 rounded-lg shadow-md transition-all duration-300 border-l-4 ${priorityStyles[task.priority]} ${lockedBg}`}>
      <div 
        className={`flex-grow flex items-start ${isPastDueAndIncomplete ? 'cursor-default' : 'cursor-pointer'}`} 
        onClick={isPastDueAndIncomplete ? undefined : () => onToggle(task.id)}
      >
         <div className={`mt-1 w-6 h-6 flex-shrink-0 rounded-full border-2 ${task.completed ? 'border-green-500 bg-green-500' : 'border-zinc-400 dark:border-zinc-500'} flex items-center justify-center transition-all duration-300 ${isPastDueAndIncomplete ? 'opacity-40 cursor-not-allowed' : ''}`}>
          {task.completed && (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
            </svg>
          )}
        </div>
        <div className="mr-4 flex flex-col">
            <span className={`text-lg font-medium ${taskTextColor} ${task.completed ? 'line-through' : ''} transition-colors duration-300`}>
            {task.text}
            </span>
            <div className="flex items-center flex-wrap gap-3 mt-1 text-xs">
                {isPastDueAndIncomplete && (
                    <span className="px-2 py-0.5 font-bold rounded-full bg-red-600 text-white">
                        متأخرة
                    </span>
                )}
                <span className={`px-2 py-0.5 font-bold rounded-full ${priorityBadgeStyles[task.priority]}`}>
                    {priorityText[task.priority]}
                </span>
                {task.dueDate && (
                     <span className={`font-semibold ${isPastDueAndIncomplete ? 'text-red-500' : 'text-zinc-500 dark:text-zinc-400'}`}>
                        ينتهي في: {formatDate(task.dueDate)}
                     </span>
                )}
            </div>
        </div>
      </div>
      <button
        onClick={() => onDelete(task.id)}
        className="text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors self-start flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-zinc-500 dark:disabled:hover:text-zinc-400"
        aria-label="Delete task"
        disabled={isPastDueAndIncomplete && !isAdmin}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </li>
  );
};

export default TaskItem;