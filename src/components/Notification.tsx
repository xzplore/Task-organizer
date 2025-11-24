import React from 'react';

interface NotificationProps {
  message: string | null;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div
      className="fixed top-24 left-1/2 -translate-x-1/2 max-w-sm w-full bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-500/50 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg shadow-lg z-50 flex justify-between items-center animate-fade-in-down"
      role="alert"
    >
      <span className="font-semibold">{message}</span>
      <button onClick={onClose} aria-label="Close notification">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default Notification;
