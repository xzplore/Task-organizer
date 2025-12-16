import React, { useState } from 'react';

type View = 'tasks' | 'pomodoro' | 'leaderboard';

interface NavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: View) => void;
  currentView: View;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({
  isOpen,
  onClose,
  onNavigate,
  currentView,
}) => {
  if (!isOpen) return null;

  const [studentsOpen, setStudentsOpen] = useState(false);

  const students = [
    'البراء بن سالم بن سعيد البوسعيدي',
    'محمد بن خالد بن خلفان الغاوي',
    'شهاب بن خالد بن محمد القليبي',
    'خميس عبدالله خميس الجهوري',
  ];

  const linkStyles =
    'flex items-center gap-4 p-4 text-lg font-semibold rounded-lg transition-colors';
  const activeLinkStyles =
    'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300';
  const inactiveLinkStyles =
    'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700';

  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="absolute top-0 right-0 h-full w-72 bg-zinc-100 dark:bg-zinc-800 shadow-2xl p-6 flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
            القائمة
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-col gap-4">
          <button
            onClick={() => {
              onNavigate('tasks');
              onClose();
            }}
            className={`${linkStyles} ${
              currentView === 'tasks'
                ? activeLinkStyles
                : inactiveLinkStyles
            }`}
          >
            منظم المهام
          </button>

          <button
            onClick={() => {
              onNavigate('pomodoro');
              onClose();
            }}
            className={`${linkStyles} ${
              currentView === 'pomodoro'
                ? activeLinkStyles
                : inactiveLinkStyles
            }`}
          >
            تقنية بومودورو
          </button>

          <button
            onClick={() => {
              onNavigate('leaderboard');
              onClose();
            }}
            className={`${linkStyles} ${
              currentView === 'leaderboard'
                ? activeLinkStyles
                : inactiveLinkStyles
            }`}
          >
            لوحة الصدارة
          </button>

          <button
            onClick={() => setStudentsOpen(v => !v)}
            className={`${linkStyles} ${inactiveLinkStyles}`}
          >
            طلاب المشروع
          </button>

          {studentsOpen && (
            <ul className="pr-8 space-y-2 text-right">
              {students.map(name => (
                <li
                  key={name}
                  className="text-sm text-zinc-600 dark:text-zinc-300"
                >
                  {name}
                </li>
              ))}
            </ul>
          )}
        </nav>
      </div>
    </div>
  );
};

export default NavigationMenu;
