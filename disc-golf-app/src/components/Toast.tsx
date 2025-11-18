import { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

const Toast = ({ message, onClose, duration = 2000 }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-toast-in">
      <div className="toast flex items-center space-x-3">
        <CheckCircle className="w-5 h-5 text-secondary-500" />
        <span className="font-medium text-gray-900 dark:text-gray-100">{message}</span>
        <button 
          onClick={onClose}
          className="ml-2 p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>
    </div>
  );
};

export default Toast;

