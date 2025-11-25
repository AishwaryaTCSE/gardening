import { useState, useEffect } from 'react';
import { FiX, FiAlertCircle, FiCheckCircle, FiInfo, FiAlertTriangle } from 'react-icons/fi';

const Alert = ({ 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose 
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) {
      setTimeout(onClose, 300); // Wait for fade out animation
    }
  };

  const alertTypes = {
    success: {
      icon: <FiCheckCircle className="h-5 w-5" />,
      bg: 'bg-green-50',
      text: 'text-green-800',
      border: 'border-green-200',
    },
    error: {
      icon: <FiAlertCircle className="h-5 w-5" />,
      bg: 'bg-red-50',
      text: 'text-red-800',
      border: 'border-red-200',
    },
    warning: {
      icon: <FiAlertTriangle className="h-5 w-5" />,
      bg: 'bg-yellow-50',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
    },
    info: {
      icon: <FiInfo className="h-5 w-5" />,
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
    },
  };

  const { icon, bg, text, border } = alertTypes[type] || alertTypes.info;

  if (!visible) return null;

  return (
    <div 
      className={`fixed top-4 right-4 z-50 w-full max-w-sm p-4 rounded-lg shadow-lg ${bg} ${border} border-l-4 ${text} transition-all duration-300 transform ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
      role="alert"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">
            {message}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={handleClose}
            className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <span className="sr-only">Close</span>
            <FiX className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Alert;