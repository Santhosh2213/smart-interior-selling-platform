import React from 'react';
import Modal from '../common/Modal';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger' }) => {
  const colors = {
    danger: {
      icon: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
    },
    warning: {
      icon: 'text-yellow-600',
      button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
    },
    info: {
      icon: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="text-center">
        <ExclamationTriangleIcon className={`h-12 w-12 mx-auto mb-4 ${colors[type].icon}`} />
        <p className="text-gray-600 mb-6">{message}</p>
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${colors[type].button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;