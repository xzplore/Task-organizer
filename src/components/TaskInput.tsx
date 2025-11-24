import React, { useState } from 'react';
import { TaskPriority } from '../types';

interface TaskInputProps {
  onAddTask: (text: string, priority: TaskPriority, dueDate?: string) => void;
}

const TaskInput: React.FC<TaskInputProps> = ({ onAddTask }) => {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTask(text, priority, dueDate);
    setText('');
    setPriority('medium');
    setDueDate('');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-200 dark:bg-slate-800 border-t border-slate-300 dark:border-slate-700 p-4 shadow-lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-3xl mx-auto">
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="أضف مهمة جديدة..."
            className="flex-grow bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 border border-slate-400 dark:border-slate-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
          />
          <button
            type="submit"
            className="bg-cyan-600 text-white dark:bg-cyan-500 dark:text-slate-900 font-bold px-6 py-2 rounded-md hover:bg-cyan-500 dark:hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-200 dark:focus:ring-offset-slate-800 focus:ring-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!text.trim()}
          >
            إضافة
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            {/* Priority Controls */}
            <div className="flex items-center gap-4">
                <span className="font-semibold text-sm text-slate-600 dark:text-slate-300">الأولوية:</span>
                <div className="flex gap-2">
                    {(['high', 'medium', 'low'] as TaskPriority[]).map(p => (
                        <label key={p} className="flex items-center gap-1 cursor-pointer text-sm">
                            <input
                                type="radio"
                                name="priority"
                                value={p}
                                checked={priority === p}
                                onChange={() => setPriority(p)}
                                className="form-radio h-4 w-4 text-cyan-600 dark:text-cyan-500 bg-slate-300 dark:bg-slate-600 border-slate-400 dark:border-slate-500 focus:ring-cyan-500"
                            />
                            <span>{{high: 'عالية', medium: 'متوسطة', low: 'منخفضة'}[p]}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Due Date Input */}
            <div className="flex items-center gap-2">
                <label htmlFor="dueDate" className="font-semibold text-sm text-slate-600 dark:text-slate-300">تاريخ الإنجاز:</label>
                <input
                    type="datetime-local"
                    id="dueDate"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-400 dark:border-slate-600 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
            </div>
        </div>
      </form>
    </div>
  );
};

export default TaskInput;