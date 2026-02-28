import React from 'react';
import { CalendarIcon, UserIcon, HomeIcon, PhotoIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const ConsultationCard = ({ project, onClick }) => {
  const navigate = useNavigate();
  
  console.log('Rendering card for project:', project._id, project.title);

  const {
    _id,
    title,
    customerName,
    customerEmail,
    createdAt,
    description,
    status,
    roomCount = 0,
    photoCount = 0,
    totalArea = 0,
    measurementUnit = 'feet'
  } = project;

  // Format date
  const formattedDate = createdAt ? new Date(createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) : 'Date not available';

  const handleCardClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onClick) {
      console.log('Using provided onClick handler');
      onClick();
    } else if (_id) {
      console.log('Navigating to project details:', _id);
      // Use navigate directly
      navigate(`/designer/consultation/${_id}`);
    } else {
      console.error('No project ID available');
    }
  };

  const handleButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (_id) {
      console.log('Button click - navigating to project:', _id);
      navigate(`/designer/consultation/${_id}`);
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 overflow-hidden"
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleCardClick(e);
        }
      }}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title || 'Untitled Project'}</h3>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            {status || 'Pending Review'}
          </span>
        </div>

        {/* Customer Info */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center text-gray-600">
            <UserIcon className="h-5 w-5 mr-2 flex-shrink-0" />
            <span className="font-medium">{customerName || 'Customer name not available'}</span>
          </div>
          
          {customerEmail && (
            <div className="flex items-center text-gray-500 text-sm ml-7">
              <EnvelopeIcon className="h-4 w-4 mr-2" />
              <span>{customerEmail}</span>
            </div>
          )}

          <div className="flex items-center text-gray-500 text-sm ml-7">
            <CalendarIcon className="h-4 w-4 mr-2" />
            <span>Received: {formattedDate}</span>
          </div>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="flex items-center justify-center text-gray-600 mb-1">
              <HomeIcon className="h-5 w-5" />
            </div>
            <div className="text-sm font-medium text-gray-900">{roomCount}</div>
            <div className="text-xs text-gray-500">Rooms</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center text-gray-600 mb-1">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0-4h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </div>
            <div className="text-sm font-medium text-gray-900">
              {typeof totalArea === 'number' ? totalArea.toFixed(2) : '0.00'}
            </div>
            <div className="text-xs text-gray-500">Sq.{measurementUnit}</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center text-gray-600 mb-1">
              <PhotoIcon className="h-5 w-5" />
            </div>
            <div className="text-sm font-medium text-gray-900">{photoCount}</div>
            <div className="text-xs text-gray-500">Photos</div>
          </div>
        </div>

        {/* Description (if any) */}
        {description && (
          <p className="mt-4 text-sm text-gray-600 line-clamp-2">
            {description}
          </p>
        )}

        {/* Action Button */}
        <div className="mt-4">
          <button 
            onClick={handleButtonClick}
            className="w-full bg-blue-50 text-blue-600 py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
          >
            Review Project
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsultationCard;