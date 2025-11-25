import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Task, TaskPriority } from './types';
import TaskInput from './components/TaskInput';
import TaskList from './components/TaskList';
import ProductivityTracker from './components/ProductivityTracker';
// FIX: Renamed `Notification` to `NotificationComponent` to avoid conflict with the browser's Notification API.
import NotificationComponent from './components/Notification';
import Header from './components/Header';
import NavigationMenu from './components/NavigationMenu';
import PomodoroTimer from './components/PomodoroTimer';
import NotificationPermissionBanner from './components/NotificationPermissionBanner';

type View = 'tasks' | 'pomodoro';

const App: React.FC = () => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });
  
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const savedTasks = localStorage.getItem('tasks');
      return savedTasks ? JSON.parse(savedTasks) : [];
    } catch (error)
      {
      console.error("Could not parse tasks from localStorage", error);
      return [];
    }
  });

  const [notification, setNotification] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentView, setCurrentView] = useState<View>('tasks');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // This effect runs once on mount to check notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    } else {
      console.log("This browser does not support desktop notification");
      setNotificationPermission('denied');
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === 'dark';

    root.classList.toggle('dark', isDark);
    root.style.colorScheme = isDark ? 'dark' : 'light';

    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Effect to check for and send notifications for upcoming tasks
  useEffect(() => {
    if (notificationPermission !== 'granted') {
      return;
    }

    const showNotification = (task: Task) => {
        new Notification(`تذكير بمهمة: ${task.text}`, {
          body: `هذه المهمة ستنتهي خلال 5 دقائق.`,
          icon: '/favicon.ico',
        });
        audioRef.current?.play();
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, notificationSent: true } : t));
    };

    tasks.forEach(task => {
      if (task.dueDate && !task.completed && !task.notificationSent) {
        const dueTime = new Date(task.dueDate).getTime();
        const timeDiff = dueTime - currentTime.getTime();
        const fiveMinutes = 5 * 60 * 1000;
        if (timeDiff > 0 && timeDiff <= fiveMinutes) {
          showNotification(task);
        }
      }
    });
  }, [currentTime, tasks, notificationPermission]);


  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000); // Auto-dismiss after 4 seconds
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleRequestPermission = () => {
    if (!('Notification' in window)) {
        setNotification('متصفحك لا يدعم الإشعارات.');
        return;
    }
    Notification.requestPermission(status => {
        setNotificationPermission(status);
        if (status === 'granted') {
            setNotification('تم تفعيل الإشعارات بنجاح!');
        } else {
            setNotification('تم رفض إذن الإشعارات. يمكنك تفعيلها من إعدادات المتصفح.');
        }
    });
  };

  const handleStartNewDay = () => {
    if (window.confirm('هل أنت متأكد أنك تريد بدء يوم جديد؟ سيتم حذف جميع المهام الحالية والمتأخرة.')) {
      setTasks([]);
      setNotification('تم بدء يوم جديد بنجاح!');
    }
  };

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const addTask = (text: string, priority: TaskPriority, dueDate?: string) => {
    const trimmedText = text.trim();
    if (trimmedText === '') return;
    
    const commandText = trimmedText.toLowerCase();

    if (commandText === 'alarm') {
      setNotification('جاري اختبار الإشعار والصوت...');
      audioRef.current?.play();
      
      if (notificationPermission === 'granted') {
          new Notification('تنبيه تجريبي!', { body: 'هذا هو شكل الإشعار الذي سيصلك.'});
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
    setTasks(prevTasks => [newTask, ...prevTasks]);
  };

  const toggleTask = (id: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  };

  const sortedTasks = useMemo(() => {
    const priorityOrder: { [key in TaskPriority]: number } = { high: 1, medium: 2, low: 3 };
    return [...tasks].sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.createdAt - a.createdAt;
    });
  }, [tasks]);

  const { todayTasks, overdueTasks } = useMemo(() => {
    const todayTasksList: Task[] = [];
    const overdueTasksList: Task[] = [];
    sortedTasks.forEach(task => {
      const isOverdue = !task.completed && task.dueDate && new Date(task.dueDate) < currentTime;
      if (isOverdue) overdueTasksList.push(task);
      else todayTasksList.push(task);
    });
    const priorityOrder: { [key in TaskPriority]: number } = { high: 1, medium: 2, low: 3 };
    overdueTasksList.sort((a, b) => {
       const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime();
    });
    return { todayTasks: todayTasksList, overdueTasks: overdueTasksList };
  }, [sortedTasks, currentTime]);

  const productivityPercentage = useMemo(() => {
    const allTasks = [...todayTasks, ...overdueTasks];
    if (allTasks.length === 0) return 100;
    const completedTasks = todayTasks.filter(task => task.completed).length;
    return Math.round((completedTasks / allTasks.length) * 100);
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
      
      {notificationPermission === 'default' && <NotificationPermissionBanner onRequestPermission={handleRequestPermission} />}
      
      {/* FIX: Renamed `Notification` to `NotificationComponent` to avoid conflict with the browser's Notification API. */}
      <NotificationComponent message={notification} onClose={() => setNotification(null)} />
      
      <main className="flex-grow p-4 md:p-6 pb-28">
        <div className="max-w-3xl mx-auto">
          {currentView === 'tasks' ? (
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
          ) : (
            <PomodoroTimer theme={theme} />
          )}
        </div>
      </main>
      
      {currentView === 'tasks' && <TaskInput onAddTask={addTask} />}
    </div>
  );
};

export default App;
