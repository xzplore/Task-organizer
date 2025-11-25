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

type View = 'tasks' | 'pomodoro';

const App: React.FC = () => {
  /* ----------------------- THEME SYSTEM ----------------------- */
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;

    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === 'dark';

    root.classList.toggle('dark', isDark);
    root.style.colorScheme = isDark ? 'dark' : 'light';

    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  /* ------------------------------------------------------------- */

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('tasks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [notification, setNotification] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('tasks');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>('default');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    } else {
      setNotificationPermission('denied');
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  /* ----------------------- NOTIFICATIONS ----------------------- */
  useEffect(() => {
    if (notificationPermission !== 'granted') return;

    const notify = (task: Task) => {
      new Notification(`تذكير بمهمة: ${task.text}`, {
        body: 'هذه المهمة ستنتهي خلال 5 دقائق.',
        icon: '/favicon.ico',
      });
      audioRef.current?.play();

      setTasks(prev =>
        prev.map(t =>
          t.id === task.id ? { ...t, notificationSent: true } : t
        )
      );
    };

    tasks.forEach(task => {
      if (
        task.dueDate &&
        !task.completed &&
        !task.notificationSent
      ) {
        const due = new Date(task.dueDate).getTime();
        const diff = due - currentTime.getTime();
        const fiveMin = 5 * 60 * 1000;

        if (diff > 0 && diff <= fiveMin) notify(task);
      }
    });
  }, [tasks, currentTime, notificationPermission]);

  /* --------------------- NOTIFICATION HELPERS ------------------- */

  const handleRequestPermission = () => {
    if (!('Notification' in window)) {
      setNotification('متصفحك لا يدعم الإشعارات.');
      return;
    }

    Notification.requestPermission().then(status => {
      setNotificationPermission(status);

      setNotification(
        status === 'granted'
          ? 'تم تفعيل الإشعارات!'
          : 'تم رفض طلب الإشعارات.'
      );
    });
  };

  /* -------------------------- TASK LOGIC ------------------------ */

  const addTask = (text: string, priority: TaskPriority, dueDate?: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const cmd = trimmed.toLowerCase();

    if (cmd === 'admin') {
      setIsAdmin(true);
      setNotification('تم تفعيل وضع المسؤول');
      return;
    }

    if (cmd === 'unadmin') {
      setIsAdmin(false);
      setNotification('تم إلغاء وضع المسؤول');
      return;
    }

    if (cmd === 'alarm') {
      audioRef.current?.play();
      if (notificationPermission === 'granted') {
        new Notification('تنبيه تجريبي!');
      } else {
        setNotification('قم بالسماح للإشعارات أولاً.');
      }
      return;
    }

    if (
      tasks.some(
        t => t.text.trim().toLowerCase() === trimmed.toLowerCase()
      )
    ) {
      setNotification('هذه المهمة موجودة مسبقاً!');
      return;
    }

    const newTask: Task = {
      id: crypto.randomUUID(),
      text: trimmed,
      completed: false,
      createdAt: Date.now(),
      priority,
      dueDate,
      notificationSent: false,
    };

    setTasks(prev => [newTask, ...prev]);
  };

  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  /* -------------------- SORTING + PRODUCTIVITY ------------------ */

  const sortedTasks = useMemo(() => {
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    return [...tasks].sort((a, b) => {
      const diff = priorityOrder[a.priority] - priorityOrder[b.priority];
      return diff !== 0 ? diff : b.createdAt - a.createdAt;
    });
  }, [tasks]);

  const { todayTasks, overdueTasks } = useMemo(() => {
    const today: Task[] = [];
    const overdue: Task[] = [];

    sortedTasks.forEach(t => {
      const due = t.dueDate ? new Date(t.dueDate) : null;

      if (due && !t.completed && due < currentTime) {
        overdue.push(t);
      } else {
        today.push(t);
      }
    });

    const priorityOrder = { high: 1, medium: 2, low: 3 };
    overdue.sort(
      (a, b) =>
        priorityOrder[a.priority] - priorityOrder[b.priority]
    );

    return { todayTasks: today, overdueTasks: overdue };
  }, [sortedTasks, currentTime]);

  const productivity = useMemo(() => {
    const all = [...todayTasks, ...overdueTasks];
    if (all.length === 0) return 100;

    const done = todayTasks.filter(t => t.completed).length;
    return Math.round((done / all.length) * 100);
  }, [todayTasks, overdueTasks]);

  /* --------------------------- VIEW UI -------------------------- */

  const handleNavigate = (v: View) => {
    setCurrentView(v);
    setIsMenuOpen(false);
  };

  /* ---------------------------- RENDER --------------------------- */

  return (
    <div className="min-h-screen flex flex-col">
      <audio
        ref={audioRef}
        src="https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3"
        preload="auto"
      />

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
        <NotificationPermissionBanner
          onRequestPermission={handleRequestPermission}
        />
      )}

      <NotificationComponent
        message={notification}
        onClose={() => setNotification(null)}
      />

      <main className="flex-grow p-4 md:p-6 pb-28">
        <div className="max-w-3xl mx-auto">
          {currentView === 'tasks' ? (
            <>
              <ProductivityTracker
                percentage={productivity}
                theme={theme}
              />

              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => {
                    if (
                      window.confirm('بدء يوم جديد وحذف المهام؟')
                    )
                      setTasks([]);
                  }}
                  className="bg-red-600 text-white dark:bg-red-700 dark:hover:bg-red-600 font-bold px-6 py-2 rounded-lg hover:bg-red-500 transition-all"
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
                حقوق الطبع © {new Date().getFullYear()}
              </footer>
            </>
          ) : (
            <PomodoroTimer theme={theme} />
          )}
        </div>
      </main>

      {currentView === 'tasks' && (
        <TaskInput onAddTask={addTask} />
      )}
    </div>
  );
};

export default App;
