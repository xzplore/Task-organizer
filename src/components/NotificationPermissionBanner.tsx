import React from 'react';

interface NotificationPermissionBannerProps {
  onRequestPermission: () => void;
}

const NotificationPermissionBanner: React.FC<NotificationPermissionBannerProps> = ({ onRequestPermission }) => {
  return (
    <div className="bg-cyan-600 dark:bg-cyan-500 text-white dark:text-zinc-900 p-3 text-center shadow-md">
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2">
        <p className="font-semibold">هل ترغب في تلقي إشعارات لتذكيرك بالمهام القادمة؟</p>
        <button
          onClick={onRequestPermission}
          className="bg-white/90 text-cyan-700 dark:bg-zinc-900/80 dark:text-cyan-400 font-bold px-4 py-1 rounded-md hover:bg-white dark:hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cyan-600 dark:focus:ring-offset-cyan-500 focus:ring-white dark:focus:ring-black transition-all"
        >
          تفعيل الآن
        </button>
      </div>
    </div>
  );
};

export default NotificationPermissionBanner;
