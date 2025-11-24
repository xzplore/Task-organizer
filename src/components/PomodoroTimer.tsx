import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

type Mode = 'work' | 'shortBreak' | 'longBreak';

const TIMES: { [key in Mode]: number } = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

const PomodoroTimer: React.FC<{ theme: string }> = ({ theme }) => {
  const [mode, setMode] = useState<Mode>('work');
  const [timeRemaining, setTimeRemaining] = useState(TIMES.work);
  const [isActive, setIsActive] = useState(false);
  const [pomodoros, setPomodoros] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Pre-load the audio
    audioRef.current = new Audio('https://www.soundjay.com/buttons/sounds/button-16.mp3');
  }, []);

  useEffect(() => {
    // Fix: Changed NodeJS.Timeout to number for browser compatibility.
    let interval: number | null = null;

    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => time - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      audioRef.current?.play();
      handleSessionEnd();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeRemaining]);
  
  const handleSessionEnd = () => {
    setIsActive(false);
    if (mode === 'work') {
      const newPomodoroCount = pomodoros + 1;
      setPomodoros(newPomodoroCount);
      if (newPomodoroCount % 4 === 0) {
        setMode('longBreak');
        setTimeRemaining(TIMES.longBreak);
      } else {
        setMode('shortBreak');
        setTimeRemaining(TIMES.shortBreak);
      }
    } else {
      setMode('work');
      setTimeRemaining(TIMES.work);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setMode('work');
    setTimeRemaining(TIMES.work);
    setPomodoros(0);
  };
  
  const selectMode = (newMode: Mode) => {
    setIsActive(false);
    setMode(newMode);
    setTimeRemaining(TIMES[newMode]);
  }

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  const percentage = ((TIMES[mode] - timeRemaining) / TIMES[mode]) * 100;

  const data = [
    { name: 'Elapsed', value: percentage },
    { name: 'Remaining', value: 100 - percentage },
  ];
  
  const COLORS = theme === 'dark'
    ? ['#14b8a6', '#475569'] // dark: teal-500, slate-600
    : ['#0d9488', '#e2e8f0']; // light: teal-600, slate-200

  const modeText: {[key in Mode]: string} = {
    work: 'وقت التركيز',
    shortBreak: 'استراحة قصيرة',
    longBreak: 'استراحة طويلة'
  }

  return (
    <section className="bg-slate-200 dark:bg-slate-800 p-6 rounded-lg shadow-lg flex flex-col items-center">
      <div className="flex gap-2 mb-6">
        {(['work', 'shortBreak', 'longBreak'] as Mode[]).map(m => (
            <button key={m} onClick={() => selectMode(m)} className={`px-4 py-2 text-sm font-bold rounded-full transition-colors ${mode === m ? 'bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-900' : 'bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600'}`}>
                {modeText[m]}
            </button>
        ))}
      </div>
      <div className="w-64 h-64 relative mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={[{value: 100}]} dataKey="value" stroke={theme === 'dark' ? '#334155' : '#cbd5e1'} fill="transparent" />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={95}
              outerRadius={110}
              startAngle={90}
              endAngle={450}
              dataKey="value"
              stroke="none"
            >
              <Cell fill={COLORS[0]} />
              <Cell fill="transparent" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl font-bold text-cyan-600 dark:text-cyan-400" dir="ltr">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
      </div>
      <div className="flex gap-4">
        <button
          onClick={toggleTimer}
          className="bg-cyan-600 text-white dark:bg-cyan-500 dark:text-slate-900 font-bold px-10 py-3 rounded-lg hover:bg-cyan-500 dark:hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-200 dark:focus:ring-offset-slate-800 focus:ring-cyan-500 transition-colors text-2xl"
        >
          {isActive ? 'إيقاف مؤقت' : 'ابدأ'}
        </button>
        <button
            onClick={resetTimer}
            className="p-3 text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
            aria-label="Reset Timer"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 10.5M20 20l-1.5-1.5A9 9 0 003.5 13.5" />
            </svg>
        </button>
      </div>
       <div className="mt-4 text-lg font-semibold text-slate-600 dark:text-slate-300">
        جلسات البومودورو المكتملة: {pomodoros}
      </div>
    </section>
  );
};

export default PomodoroTimer;