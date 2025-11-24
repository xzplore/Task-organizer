import React from 'react';

type View = 'tasks' | 'pomodoro';

interface NavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: View) => void;
  currentView: View;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({ isOpen, onClose, onNavigate, currentView }) => {
  if (!isOpen) return null;

  const linkStyles = "flex items-center gap-4 p-4 text-lg font-semibold rounded-lg transition-colors";
  const activeLinkStyles = "bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300";
  const inactiveLinkStyles = "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700";

  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Menu Panel */}
      <div className="absolute top-0 right-0 h-full w-72 bg-zinc-100 dark:bg-zinc-800 shadow-2xl p-6 flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">القائمة</h2>
          <button onClick={onClose} className="p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700" aria-label="Close menu">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex flex-col gap-4">
          <button onClick={() => onNavigate('tasks')} className={`${linkStyles} ${currentView === 'tasks' ? activeLinkStyles : inactiveLinkStyles}`}>
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
             </svg>
            <span>منظم المهام</span>
          </button>
          <button onClick={() => onNavigate('pomodoro')} className={`${linkStyles} ${currentView === 'pomodoro' ? activeLinkStyles : inactiveLinkStyles}`}>
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
            <span>تقنية بومودورو</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default NavigationMenu;