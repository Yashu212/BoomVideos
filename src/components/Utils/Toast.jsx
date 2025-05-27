import React,{useState,useEffect} from 'react';
import {XCircle, CheckCircle, Info} from 'lucide-react';

const Toast = ({ id, message, type, onClose, isDarkMode }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300);
    }, 4000); 

    return () => clearTimeout(timer);
  }, [id, onClose]);

  let bgColorClass = '';
  let textColorClass = '';
  let icon = null;

  switch (type) {
    case 'success':
      bgColorClass = isDarkMode ? 'bg-green-700' : 'bg-green-500';
      textColorClass = 'text-white';
      icon = <CheckCircle size={20} />;
      break;
    case 'error':
      bgColorClass = isDarkMode ? 'bg-red-700' : 'bg-red-500';
      textColorClass = 'text-white';
      icon = <XCircle size={20} />;
      break;
    case 'info':
    default:
      bgColorClass = isDarkMode ? 'bg-blue-700' : 'bg-blue-500';
      textColorClass = 'text-white';
      icon = <Info size={20} />;
      break;
  }

  return (
    <div
      className={`
        relative flex items-center space-x-3 p-4 rounded-lg shadow-lg mb-3
        transform transition-all duration-300
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${bgColorClass} ${textColorClass}
      `}
      role="alert"
    >
      {icon}
      <p className="flex-1">{message}</p>
      <button
        onClick={() => { setIsVisible(false); setTimeout(() => onClose(id), 300); }}
        className="absolute top-2 right-2 text-white opacity-70 hover:opacity-100"
        aria-label="Close toast"
      >
        <XCircle size={16} />
      </button>
    </div>
  );
};

export default Toast;