import React from 'react';
import { Link } from 'react-router-dom';
import { ClockIcon, DocumentTextIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const ProjectCard = ({ project }) => {
  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      quoted: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      completed: 'bg-purple-100 text-purple-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.draft;
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'draft': return <DocumentTextIcon className="h-4 w-4" />;
      case 'pending': return <ClockIcon className="h-4 w-4" />;
      case 'quoted': return <DocumentTextIcon className="h-4 w-4" />;
      case 'approved': return <CheckCircleIcon className="h-4 w-4" />;
      default: return <DocumentTextIcon className="h-4 w-4" />;
    }
  };

  return (
    <Link to={`/customer/projects/${project._id}`}>
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
        {/* Image */}
        <div className="h-40 bg-gradient-to-r from-primary-500 to-primary-600 relative">
          {project.images && project.images.length > 0 ? (
            <img
              src={project.images[0].imageUrl}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <DocumentTextIcon className="h-12 w-12 text-white opacity-50" />
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
              {getStatusIcon(project.status)}
              <span className="ml-1 capitalize">{project.status}</span>
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
            {project.title}
          </h3>
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {project.description || 'No description'}
          </p>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-500">
              <ClockIcon className="h-4 w-4 mr-1" />
              {new Date(project.createdAt).toLocaleDateString()}
            </div>
            
            <div className="text-primary-600 font-medium">
              {project.measurements?.length || 0} areas
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;