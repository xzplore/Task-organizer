import React from 'react';
import { Task } from '../types';
import TaskItem from './TaskItem';

interface TaskListProps {
  title: string;
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  isOverdue?: boolean;
  isAdmin?: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ title, tasks, onToggle, onDelete, isOverdue = false, isAdmin = false }) => {
  return (
    <section className="mt-8">
      <h2 className={`text-2xl font-bold mb-4 pb-2 border-b-2 ${isOverdue ? 'border-red-500 text-red-600 dark:text-red-500' : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}>{title}</h2>
      {tasks.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400 text-center py-4">لا توجد مهام لعرضها.</p>
      ) : (
        <ul className="space-y-3">
          {tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggle}
              onDelete={onDelete}
              isAdmin={isAdmin}
            />
          ))}
        </ul>
      )}
    </section>
  );
};

export default TaskList;