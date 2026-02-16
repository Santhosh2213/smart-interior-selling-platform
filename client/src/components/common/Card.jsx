import React from 'react';

const Card = ({ children, className = '', padding = true, shadow = true }) => {
  return (
    <div className={`
      bg-white rounded-lg
      ${shadow ? 'shadow' : ''}
      ${padding ? 'p-6' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};

export default Card;