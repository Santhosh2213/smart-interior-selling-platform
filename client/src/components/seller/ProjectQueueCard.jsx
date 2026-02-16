import React from 'react';
import { Link } from 'react-router-dom';
import { UserIcon, CalendarIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';

const ProjectQueueCard = ({ project }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{project.title}</h3>
          <p className="text-sm text-gray-600 mt-1">Project #{project._id?.slice(-6)}</p>
        </div>
        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded">
          Pending
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
          {project.customerId?.userId?.name || 'Customer Name'}
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
          Submitted: {new Date(project.submittedAt).toLocaleDateString()}
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <ArrowsRightLeftIcon className="h-4 w-4 mr-2 text-gray-400" />
          Total Area: {project.totalArea?.toFixed(2)} {project.measurementUnit === 'feet' ? 'sq ft' : 'sq m'}
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <div className="text-sm">
          <span className="text-gray-600">Materials:</span>
          <span className="ml-1 font-medium">{project.materials?.length || 0} items</span>
        </div>
        
        <Link
          to={`/seller/create-quotation/${project._id}`}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700 transition-colors"
        >
          Create Quotation
        </Link>
      </div>
    </div>
  );
};

export default ProjectQueueCard;