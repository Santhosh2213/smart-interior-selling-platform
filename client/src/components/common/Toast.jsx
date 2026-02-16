import React, { useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircleIcon className="h-5 w-5 text-green-400" />,
    error: <XCircleIcon className="h-5 w-5 text-red-400" />,
    warning: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />,
    info: <InformationCircleIcon className="h-5 w-5 text-blue-400" />
  };

  const colors = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200'
  };

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg border ${colors[type]}`}>
      <div className="flex items-center">
        {icons[type]}
        <p className="ml-3 text-sm font-medium">{message}</p>
      </div>
      <button onClick={onClose} className="ml-4 text-gray-400 hover:text-gray-600">
        <XCircleIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;