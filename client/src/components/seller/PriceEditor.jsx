import React, { useState } from 'react';
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const PriceEditor = ({ value, onSave, min = 0, step = 0.01 }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onSave(parseFloat(editValue));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="flex items-center space-x-2">
        <span className="font-medium">₹{value?.toFixed(2)}</span>
        <button
          onClick={() => setIsEditing(true)}
          className="text-gray-400 hover:text-primary-600"
        >
          <PencilIcon className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <input
        type="number"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        min={min}
        step={step}
        className="w-24 px-2 py-1 border rounded text-sm"
        autoFocus
      />
      <button
        onClick={handleSave}
        className="text-green-600 hover:text-green-700"
      >
        <CheckIcon className="h-4 w-4" />
      </button>
      <button
        onClick={handleCancel}
        className="text-red-600 hover:text-red-700"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

export default PriceEditor;