import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ClipboardDocumentListIcon,
  UserIcon,
  CalendarIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline';
import { getSellerProjectQueue } from '../../services/projectService'; // Fix import
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const ProjectQueue = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    quoted: 0,
    completed: 0
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await getSellerProjectQueue(); // Fix function call
      const projectsData = response.data || [];
      setProjects(projectsData);
      
      // Calculate stats
      const stats = {
        total: projectsData.length,
        pending: projectsData.filter(p => p.status === 'pending' || p.status === 'PENDING_DESIGN').length,
        inProgress: projectsData.filter(p => p.status === 'quoting' || p.status === 'DESIGN_IN_PROGRESS').length,
        quoted: projectsData.filter(p => p.status === 'quoted' || p.status === 'DESIGN_APPROVED').length,
        completed: projectsData.filter(p => p.status === 'completed').length
      };
      setStats(stats);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending':
      case 'PENDING_DESIGN':
        return 'bg-yellow-100 text-yellow-800';
      case 'quoting':
      case 'DESIGN_IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'quoted':
      case 'DESIGN_APPROVED':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCustomerName = (project) => {
    if (project.customerName) return project.customerName;
    if (project.customerId?.userId?.name) return project.customerId.userId.name;
    if (project.customerId?.name) return project.customerId.name;
    return 'Unknown Customer';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Project Queue</h1>
      <p className="text-gray-600 mb-8">Manage incoming project requests</p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">In Progress</p>
          <p className="text-2xl font-bold">{stats.inProgress}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Quoted</p>
          <p className="text-2xl font-bold">{stats.quoted}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-2xl font-bold">{stats.completed}</p>
        </div>
      </div>

      {/* Projects List */}
      {projects.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <ClipboardDocumentListIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No projects in queue</p>
          <p className="text-sm text-gray-500">
            New projects will appear here when customers submit them.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project._id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                    {project.title}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                    {project.status === 'PENDING_DESIGN' ? 'Pending Design' : project.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <UserIcon className="h-4 w-4 mr-2" />
                    {getCustomerName(project)}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {new Date(project.createdAt || project.submittedAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{project.measurements?.length || project.roomCount || 0} areas</span>
                  <span>{project.images?.length || project.photoCount || 0} photos</span>
                </div>

                <Link
                  to={`/seller/quotations/create/${project._id}`} // Fixed: matches route in AppRoutes.jsx
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  Create Quotation
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectQueue;