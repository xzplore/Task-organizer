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
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
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

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const savedTasks = localStorage.getItem('tasks');
      return savedTasks ? JSON.parse(savedTasks) : [];
    } catch {
      return [];
    }
  });

  const [notification, setNotification] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentView, setCurrentView] = useState<View>('tasks');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>('default');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
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

    tasks.forEach(task => {
      if (task.dueDate && !task.completed && !task.notificationSent) {
        const diff = new Date(task.dueDate).getTime() - currentTime.getTime();
        if (diff > 0 && diff <= 300000) {
          new Notification(`تذكير بمهمة: ${task.text}`);
          audioRef.current?.play();
          setTasks(prev =>
            prev.map(t =>
              t.id === task.id ? { ...t, notificationSent: true } : t
            )
          );
        }
      }
    });
  }, [currentTime, tasks, notificationPermission]);

  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(null), 4000);
    return () => clearTimeout(t);
  }, [notification]);

  const handleRequestPermission = () => {
    Notification.requestPermission().then(setNotificationPermission);
  };

  const handleStartNewDay = () => {
    if (window.confirm('هل أنت متأكد؟')) {
      setTasks([]);
      setNotification('تم بدء يوم جديد');
    }
  };

  const addTask = (text: string, priority: TaskPriority, dueDate?: string) => {
    if (!text.trim()) return;

    if (text === 'admin') {
      setIsAdmin(true);
      return;
    }

    setTasks(prev => [
      {
        id: crypto.randomUUID(),
        text,
        completed: false,
        createdAt: Date.now(),
        priority,
        dueDate,
        notificationSent: false,
      },
      ...prev,
    ]);
  };

  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const sortedTasks = useMemo(() => {
    const order = { high: 1, medium: 2, low: 3 };
    return [...tasks].sort(
      (a, b) => order[a.priority] - order[b.priority]
    );
  }, [tasks]);

  const handleNavigate = (view: View) => {
    setCurrentView(view);
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <audio ref={audioRef} src="https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3" />

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

      <main className="flex-grow p-4">
        {currentView === 'tasks' ? (
          <>
            <ProductivityTracker percentage={100} theme={theme} />
            <TaskList
              title="المهام"
              tasks={sortedTasks}
              onToggle={toggleTask}
              onDelete={deleteTask}
              isAdmin={isAdmin}
            />
            <button onClick={handleStartNewDay}>بدء يوم جديد</button>
          </>
        ) : (
          <PomodoroTimer theme={theme} />
        )}
      </main>

      {currentView === 'tasks' && <TaskInput onAddTask={addTask} />}
    </div>
  );
};

export default App;
