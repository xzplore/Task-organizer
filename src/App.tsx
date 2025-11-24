import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Task, TaskPriority } from './types';
import TaskInput from './components/TaskInput';
import TaskList from './components/TaskList';
import ProductivityTracker from './components/ProductivityTracker';
import Notification from './components/Notification';
import Header from './components/Header';
import NavigationMenu from './components/NavigationMenu';
import PomodoroTimer from './components/PomodoroTimer';

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
    } catch (error) {
      console.error("Could not parse tasks from localStorage", error);
      return [];
    }
  });

  const [notification, setNotification] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentView, setCurrentView] = useState<View>('tasks');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // reset tasks daily
  useEffect(() => {
    const lastVisit = localStorage.getItem('lastVisit');
    const today = new Date().toISOString().split('T')[0];

    if (lastVisit !== today) {
      setTasks([]);
      localStorage.setItem('tasks', '[]');
      localStorage.setItem('lastVisit', today);
    }
  }, []);

  // update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // sync theme with html + localStorage
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // save tasks
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // 🔔 auto notifications for tasks (بدون طلب إذن هنا)
  useEffect(() => {
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notification");
      return;
    }

    if (Notification.permission !== "granted") {
      // ما نطلب الإذن هنا، بس نطلع لو permission مو granted
      console.log("Notification permission is not granted yet, skip auto notifications");
      return;
    }

    const fiveMinutes = 5 * 60 * 1000;

    setTasks(prev =>
      prev.map(task => {
        if (
          task.dueDate &&
          !task.completed &&
          !task.notificationSent
        ) {
          const dueTime = new Date(task.dueDate).getTime();
          const timeDiff = dueTime - currentTime.getTime();

          if (timeDiff > 0 && timeDiff <= fiveMinutes) {
            // نرسل إشعار فعلي
            try {
              new Notification(`تذكير بمهمة: ${task.text}`, {
                body: `هذه المهمة ستنتهي خلال 5 دقائق.`,
                icon: '/favicon.ico',
              });
              audioRef.current?.play();
              return { ...task, notificationSent: true };
            } catch (e) {
              console.error("Failed to show notification", e);
            }
          }
        }
        return task;
      })
    );
  }, [currentTime]); // تعتمد على الوقت فقط، ونستخدم setTasks داخلياً

  // auto hide in-app notification banner
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const addTask = (text: string, priority: TaskPriority, dueDate?: string) => {
    const trimmedText = text.trim();
    if (trimmedText === '') return;
    
    const commandText = trimmedText.toLowerCase();

    // 🔔 أمر خاص لاختبار الإشعارات
    if (commandText === 'alarm') {
      setNotification('جاري اختبار الإشعار والصوت...');

      audioRef.current?.play();

      if (!("Notification" in window)) {
        setNotification('متصفحك لا يدعم الإشعارات.');
        return;
      }

      const sendTest = () => {
        try {
          new Notification('تنبيه تجريبي!', {
            body: 'هذا هو شكل الإشعار الذي سيصلك.',
            icon: '/favicon.ico',
          });
        } catch (e) {
          console.error("Failed to show test notification", e);
        }
      };

      if (Notification.permission === "granted") {
        sendTest();
      } else {
        Notification.requestPermission()
          .then(permission => {
            if (permission === "granted") {
              sendTest();
            } else if (permission === "denied") {
              setNotification('الإشعارات مرفوضة في متصفحك.');
            } else {
              setNotification('لم يتم تفعيل الإشعارات.');
            }
          })
          .catch(err => {
            console.error("Notification permission request failed", err);
          });
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
      
      <Notification message={notification} onClose={() => setNotification(null)} />
      
      <main className="flex-grow p-4 md:p-6 pb-28">
        <div className="max-w-3xl mx-auto">
          {currentView === 'tasks' ? (
            <>
              <ProductivityTracker percentage={productivityPercentage} theme={theme} />
              
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
                مشروع مادة مهارة الدراسة © {new Date().getFullYear()}
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
