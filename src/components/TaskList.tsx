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
      <h2 className={`text-2xl font-bold mb-4 pb-2 border-b-2 ${isOverdue ? 'border-red-500 text-red-600 dark:text-red-500' : 'border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'}`}>{title}</h2>
      {tasks.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400 text-center py-4">لا توجد مهام لعرضها.</p>
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
