import React from 'react';
import { RulerIcon } from '@heroicons/react/24/outline';

const MeasurementToggle = ({ unit, onToggle }) => {
  return (
    <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
      <button
        onClick={() => onToggle('feet')}
        className={`
          flex items-center px-3 py-1.5 rounded-md text-sm font-medium
          transition-colors duration-200
          ${unit === 'feet' 
            ? 'bg-white text-primary-600 shadow' 
            : 'text-gray-600 hover:text-gray-900'
          }
        `}
      >
        <RulerIcon className="h-4 w-4 mr-1" />
        Feet (ft)
      </button>
      <button
        onClick={() => onToggle('meter')}
        className={`
          flex items-center px-3 py-1.5 rounded-md text-sm font-medium
          transition-colors duration-200
          ${unit === 'meter' 
            ? 'bg-white text-primary-600 shadow' 
            : 'text-gray-600 hover:text-gray-900'
          }
        `}
      >
        <RulerIcon className="h-4 w-4 mr-1" />
        Meters (m)
      </button>
    </div>
  );
};

export default MeasurementToggle;