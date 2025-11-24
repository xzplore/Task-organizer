import React from 'react';

interface HeaderProps {
  theme: string;
  onToggleTheme: () => void;
  isAdmin: boolean;
  onToggleMenu: () => void;
  currentView: 'tasks' | 'pomodoro';
}

const viewTitles = {
    tasks: 'منظم المهام',
    pomodoro: 'تقنية بومودورو'
}

const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme, isAdmin, onToggleMenu, currentView }) => {
  return (
    <header className={`p-4 md:p-6 backdrop-blur-sm border-b sticky top-0 z-30 transition-colors duration-300 ${isAdmin ? 'bg-amber-400/50 dark:bg-amber-800/50 border-amber-500 dark:border-amber-700' : 'bg-zinc-200/50 dark:bg-zinc-800/50 border-zinc-300 dark:border-zinc-700'}`}>
      <div className="max-w-3xl mx-auto flex justify-between items-center">
        <button onClick={onToggleTheme} className="p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-cyan-500" aria-label="Toggle theme">
          {theme === 'dark' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-bold text-cyan-600 dark:text-cyan-400">{viewTitles[currentView]}</h1>
          {currentView === 'tasks' && (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 md:h-8 md:w-8 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
             </svg>
          )}
           {currentView === 'pomodoro' && (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 md:h-8 md:w-8 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
          )}
        </div>
        
        <button onClick={onToggleMenu} className="p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-cyan-500" aria-label="Toggle menu">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;