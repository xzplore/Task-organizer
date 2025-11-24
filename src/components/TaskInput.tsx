import React, { useState } from 'react';
import { TaskPriority } from '../types';

interface TaskInputProps {
  onAddTask: (text: string, priority: TaskPriority, dueDate?: string) => void;
}

const TaskInput: React.FC<TaskInputProps> = ({ onAddTask }) => {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTask(text, priority, dueDate);
    setText('');
    setPriority('medium');
    setDueDate('');
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <div 
        className="fixed bottom-0 left-0 right-0 bg-zinc-200 dark:bg-zinc-800 border-t border-zinc-300 dark:border-zinc-700 p-3 shadow-lg cursor-pointer hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
        onClick={() => setIsExpanded(true)}
      >
        <div className="flex items-center justify-center gap-2 max-w-3xl mx-auto text-zinc-700 dark:text-zinc-200">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-bold">إضافة مهمة جديدة</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-200 dark:bg-zinc-800 border-t border-zinc-300 dark:border-zinc-700 p-4 shadow-lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-3xl mx-auto">
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="أضف مهمة جديدة..."
            className="flex-grow bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 border border-zinc-400 dark:border-zinc-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
            autoFocus
          />
          <button
            type="submit"
            className="bg-cyan-600 text-white dark:bg-cyan-500 dark:text-zinc-900 font-bold px-6 py-2 rounded-md hover:bg-cyan-500 dark:hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-200 dark:focus:ring-offset-zinc-800 focus:ring-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!text.trim()}
          >
            إضافة
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            {/* Priority Controls */}
            <div className="flex items-center gap-4">
                <span className="font-semibold text-sm text-zinc-600 dark:text-zinc-300">الأولوية:</span>
                <div className="flex gap-2">
                    {(['high', 'medium', 'low'] as TaskPriority[]).map(p => (
                        <label key={p} className="flex items-center gap-1 cursor-pointer text-sm">
                            <input
                                type="radio"
                                name="priority"
                                value={p}
                                checked={priority === p}
                                onChange={() => setPriority(p)}
                                className="form-radio h-4 w-4 text-cyan-600 dark:text-cyan-500 bg-zinc-300 dark:bg-zinc-600 border-zinc-400 dark:border-zinc-500 focus:ring-cyan-500"
                            />
                            <span>{{high: 'عالية', medium: 'متوسطة', low: 'منخفضة'}[p]}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Due Date Input */}
            <div className="flex items-center gap-2">
                <label htmlFor="dueDate" className="font-semibold text-sm text-zinc-600 dark:text-zinc-300">تاريخ الإنجاز:</label>
                <input
                    type="datetime-local"
                    id="dueDate"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-white border border-zinc-400 dark:border-zinc-600 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
            </div>
        </div>
      </form>
    </div>
  );
};

export default TaskInput;