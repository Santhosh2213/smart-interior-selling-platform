import React from 'react';

const GSTBadge = ({ rate, size = 'md' }) => {
  const getGSTColor = (rate) => {
    switch(rate) {
      case 0: return 'bg-gray-100 text-gray-800';
      case 5: return 'bg-green-100 text-green-800';
      case 12: return 'bg-blue-100 text-blue-800';
      case 18: return 'bg-yellow-100 text-yellow-800';
      case 28: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const sizes = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${getGSTColor(rate)} ${sizes[size]}`}>
      GST {rate}%
    </span>
  );
};

export default GSTBadge;