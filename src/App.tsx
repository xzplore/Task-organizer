import React, { useState, useEffect, useMemo } from 'react';
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute to check for overdue tasks
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000); // Auto-dismiss after 4 seconds
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
      return b.createdAt - a.createdAt; // Keep newest first for same priority
    });
  }, [tasks]);

  const { todayTasks, overdueTasks } = useMemo(() => {
    const todayTasksList: Task[] = [];
    const overdueTasksList: Task[] = [];

    sortedTasks.forEach(task => {
      const isOverdue = !task.completed && task.dueDate && new Date(task.dueDate) < currentTime;

      if (isOverdue) {
        overdueTasksList.push(task);
      } else {
        todayTasksList.push(task);
      }
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
      
      <main className="flex-grow p-4 md:p-6 pb-60">
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

              <footer className="text-center p-4 text-xs text-slate-500 dark:text-slate-600 mt-8">
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