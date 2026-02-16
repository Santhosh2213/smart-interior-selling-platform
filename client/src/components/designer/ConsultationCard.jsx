import React from 'react';
import { Link } from 'react-router-dom';
import { UserIcon, CalendarIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

const ConsultationCard = ({ consultation }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{consultation.project?.title}</h3>
          <p className="text-sm text-gray-600 mt-1">Customer: {consultation.customer?.userId?.name}</p>
        </div>
        <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">
          Consultation
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
          Requested: {new Date(consultation.createdAt).toLocaleDateString()}
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <ChatBubbleLeftIcon className="h-4 w-4 mr-2 text-gray-400" />
          {consultation.message || 'No message provided'}
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <div className="text-sm text-gray-500">
          Priority: <span className="font-medium capitalize">{consultation.priority || 'normal'}</span>
        </div>
        
        <Link
          to={`/designer/consultation/${consultation._id}`}
          className="btn-primary text-sm py-2"
        >
          Start Consultation
        </Link>
      </div>
    </div>
  );
};

export default ConsultationCard;