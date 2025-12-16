import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Task, TaskPriority } from './types';
import TaskInput from './components/TaskInput';
import TaskList from './components/TaskList';
import ProductivityTracker from './components/ProductivityTracker';
import NotificationComponent from './components/Notification';
import Header from './components/Header';
import NavigationMenu from './components/NavigationMenu';
import PomodoroTimer from './components/PomodoroTimer';
import NotificationPermissionBanner from './components/NotificationPermissionBanner';
import Leaderboard, { LeaderboardEntry } from './components/Leaderboard';

type View = 'tasks' | 'pomodoro' | 'leaderboard';

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === 'dark';

    root.classList.toggle('dark', isDark);
    root.style.colorScheme = isDark ? 'dark' : 'light';

    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  const [notification, setNotification] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('tasks');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [selectedName, setSelectedName] = useState(() => localStorage.getItem('selectedName') || '');

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    try {
      const raw = localStorage.getItem('leaderboard');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('selectedName', selectedName);
  }, [selectedName]);

  useEffect(() => {
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
  }, [leaderboard]);

  const ensureNameExists = (name: string) => {
    const n = name.trim();
    if (!n) return;

    setLeaderboard(prev => {
      const exists = prev.some(e => e.name === n);
      if (exists) return prev;
      return [...prev, { name: n, minutes: 0, updatedAt: Date.now() }];
    });

    setSelectedName(n);
  };

  const addFocusMinutesForSelectedUser = (minutesToAdd: number) => {
    const name = selectedName.trim();
    if (!name) {
      setNotification('اختر اسمك من لوحة الصدارة');
      setCurrentView('leaderboard');
      setIsMenuOpen(false);
      return;
    }

    setLeaderboard(prev => {
      const now = Date.now();
      const next = [...prev];
      const idx = next.findIndex(e => e.name === name);

      if (idx === -1) {
        next.push({ name, minutes: Math.max(0, minutesToAdd), updatedAt: now });
        return next;
      }

      next[idx] = {
        ...next[idx],
        minutes: next[idx].minutes + Math.max(0, minutesToAdd),
        updatedAt: now,
      };
      return next;
    });
  };

  const resetLeaderboard = () => {
    setLeaderboard([]);
    setSelectedName('');
    localStorage.removeItem('leaderboard');
    localStorage.removeItem('selectedName');
    setNotification('تم تصفير لوحة الصدارة');
  };

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const savedTasks = localStorage.getItem('tasks');
      return savedTasks ? JSON.parse(savedTasks) : [];
    } catch (error) {
      console.error('Could not parse tasks from localStorage', error);
      return [];
    }
  });

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAdmin, setIsAdmin] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if ('Notification' in window) setNotificationPermission(Notification.permission);
    else setNotificationPermission('denied');
  }, []);

  useEffect(() => {
    if (notificationPermission !== 'granted') return;

    const showNotification = (task: Task) => {
      new Notification(`تذكير بمهمة: ${task.text}`, {
        body: 'هذه المهمة ستنتهي خلال 5 دقائق.',
        icon: '/favicon.ico',
      });
      audioRef.current?.play();
      setTasks(prev => prev.map(t => (t.id === task.id ? { ...t, notificationSent: true } : t)));
    };

    tasks.forEach(task => {
      if (task.dueDate && !task.completed && !task.notificationSent) {
        const dueTime = new Date(task.dueDate).getTime();
        const diff = dueTime - currentTime.getTime();
        const fiveMinutes = 5 * 60 * 1000;
        if (diff > 0 && diff <= fiveMinutes) showNotification(task);
      }
    });
  }, [currentTime, tasks, notificationPermission]);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 4000);
    return () => clearTimeout(timer);
  }, [notification]);

  const handleRequestPermission = () => {
    if (!('Notification' in window)) {
      setNotification('متصفحك لا يدعم الإشعارات.');
      return;
    }

    Notification.requestPermission().then(status => {
      setNotificationPermission(status);
      if (status === 'granted') setNotification('تم تفعيل الإشعارات بنجاح!');
      else setNotification('تم رفض إذن الإشعارات. يمكنك تفعيلها من إعدادات المتصفح.');
    });
  };

  const handleStartNewDay = () => {
    if (window.confirm('هل أنت متأكد أنك تريد بدء يوم جديد؟ سيتم حذف جميع المهام الحالية والمتأخرة.')) {
      setTasks([]);
      setNotification('تم بدء يوم جديد بنجاح!');
    }
  };

  const addTask = (text: string, priority: TaskPriority, dueDate?: string) => {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    const commandText = trimmedText.toLowerCase();

    if (commandText === 'alarm') {
      setNotification('جاري اختبار الإشعار والصوت...');
      audioRef.current?.play();

      if (notificationPermission === 'granted') {
        new Notification('تنبيه تجريبي!', { body: 'هذا هو شكل الإشعار الذي سيصلك.' });
      } else if (notificationPermission === 'default') {
        setNotification('الرجاء تفعيل الإشعارات باستخدام الشريط في الأعلى.');
      } else {
        setNotification('الإشعارات معطلة. يرجى تفعيلها من إعدادات المتصفح.');
      }
      return;
    }

    if (commandText === 'admin') {
      setIsAdmin(true);
      setNotification('وضع المسؤول مفعل!');
      return;
    }

    if (commandText === 'unadmin') {
      setIsAdmin(false);
      setNotification('تم إلغاء تفعيل وضع المسؤول.');
      return;
    }

    if (tasks.some(task => task.text.trim().toLowerCase() === trimmedText.toLowerCase())) {
      setNotification('هذه المهمة موجودة بالفعل!');
      return;
    }

    const newTask: Task = {
      id: crypto.randomUUID(),
      text: trimmedText,
      completed: false,
      createdAt: Date.now(),
      priority,
      dueDate: dueDate || undefined,
      notificationSent: false,
    };

    setTasks(prev => [newTask, ...prev]);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(task => (task.id === id ? { ...task, completed: !task.completed } : task)));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const sortedTasks = useMemo(() => {
    const priorityOrder: Record<TaskPriority, number> = { high: 1, medium: 2, low: 3 };
    return [...tasks].sort((a, b) => {
      const diff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (diff !== 0) return diff;
      return b.createdAt - a.createdAt;
    });
  }, [tasks]);

  const { todayTasks, overdueTasks } = useMemo(() => {
    const today: Task[] = [];
    const overdue: Task[] = [];

    sortedTasks.forEach(task => {
      const isOverdue = !task.completed && task.dueDate && new Date(task.dueDate) < currentTime;
      if (isOverdue) overdue.push(task);
      else today.push(task);
    });

    const priorityOrder: Record<TaskPriority, number> = { high: 1, medium: 2, low: 3 };

    overdue.sort((a, b) => {
      const diff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (diff !== 0) return diff;
      return new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime();
    });

    return { todayTasks: today, overdueTasks: overdue };
  }, [sortedTasks, currentTime]);

  const productivityPercentage = useMemo(() => {
    const allTasks = [...todayTasks, ...overdueTasks];
    if (allTasks.length === 0) return 100;
    const completed = todayTasks.filter(t => t.completed).length;
    return Math.round((completed / allTasks.length) * 100);
  }, [todayTasks, overdueTasks]);

  const handleNavigate = (view: View) => {
    setCurrentView(view);
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <audio ref={audioRef} src="https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3" preload="auto" />

      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        isAdmin={isAdmin}
        onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
        currentView={currentView}
      />

      <NavigationMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={handleNavigate}
        currentView={currentView}
      />

      {notificationPermission === 'default' && (
        <NotificationPermissionBanner onRequestPermission={handleRequestPermission} />
      )}

      <NotificationComponent message={notification} onClose={() => setNotification(null)} />

      <main className="flex-grow p-4 md:p-6 pb-28">
        <div className="max-w-3xl mx-auto">
          {currentView === 'tasks' && (
            <>
              <ProductivityTracker percentage={productivityPercentage} theme={theme} />

              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleStartNewDay}
                  className="bg-red-600 text-white dark:bg-red-700 dark:hover:bg-red-600 font-bold px-6 py-2 rounded-lg hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-100 dark:focus:ring-offset-zinc-950 focus:ring-red-500 transition-all transform hover:scale-105"
                >
                  بدء يوم جديد
                </button>
              </div>

              {overdueTasks.length > 0 && (
                <TaskList
                  title="مهام متأخرة"
                  tasks={overdueTasks}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                  isOverdue={true}
                  isAdmin={isAdmin}
                />
              )}

              <TaskList
                title="المهام القادمة"
                tasks={todayTasks}
                onToggle={toggleTask}
                onDelete={deleteTask}
                isAdmin={isAdmin}
              />

              <footer className="text-center p-4 text-xs text-zinc-500 dark:text-zinc-600 mt-8">
                حقوق الطبع محفوظة لمشروع مادة مهارات الدراسة © {new Date().getFullYear()}
              </footer>
            </>
          )}

          {currentView === 'pomodoro' && (
            <PomodoroTimer
              theme={theme}
              onWorkSessionComplete={(mins: number) => {
                addFocusMinutesForSelectedUser(mins);
              }}
            />
          )}

          {currentView === 'leaderboard' && (
            <Leaderboard
              entries={leaderboard}
              selectedName={selectedName}
              onSelectName={setSelectedName}
              onAddName={ensureNameExists}
              onReset={resetLeaderboard}
            />
          )}
        </div>
      </main>

      {currentView === 'tasks' && <TaskInput onAddTask={addTask} />}
    </div>
  );
};

export default App;
