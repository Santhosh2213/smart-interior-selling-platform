import React from 'react';

const DimensionInput = ({ label, value, onChange, unit, error }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} ({unit})
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        step="0.01"
        min="0.01"
        className={`
          w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent
          ${error ? 'border-red-500' : 'border-gray-300'}
        `}
        placeholder={`Enter ${label.toLowerCase()}`}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default DimensionInput;