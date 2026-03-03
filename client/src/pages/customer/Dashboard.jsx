import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCustomerProjects } from '../../services/projectService';
import { 
  PlusIcon, 
  ClipboardDocumentListIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await getCustomerProjects();
      setProjects(response.data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
      case 'PENDING_DESIGN':
        return 'bg-yellow-100 text-yellow-800';
      case 'DESIGN_COMPLETED':
      case 'DESIGN_SUBMITTED':
        return 'bg-blue-100 text-blue-800';
      case 'DESIGN_APPROVED':
      case 'quoted':
        return 'bg-purple-100 text-purple-800';
      case 'DESIGN_REJECTED':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'draft': return 'Draft';
      case 'pending': return 'Pending Review';
      case 'PENDING_DESIGN': return 'Awaiting Design';
      case 'DESIGN_COMPLETED': return 'Design Ready';
      case 'DESIGN_SUBMITTED': return 'Design Ready';
      case 'DESIGN_APPROVED': return 'Design Approved';
      case 'quoted': return 'Quotation Ready';
      case 'DESIGN_REJECTED': return 'Design Rejected';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  const stats = {
    total: projects.length,
    draft: projects.filter(p => p.status === 'draft').length,
    pending: projects.filter(p => p.status === 'pending' || p.status === 'PENDING_DESIGN').length,
    designReady: projects.filter(p => p.status === 'DESIGN_COMPLETED' || p.status === 'DESIGN_SUBMITTED').length,
    quoted: projects.filter(p => p.status === 'quoted' || p.status === 'DESIGN_APPROVED').length,
    completed: projects.filter(p => p.status === 'completed').length
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
            <p className="text-gray-600">Manage your interior design projects</p>
          </div>
          <Link
            to="/customer/projects/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Project
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Draft</p>
            <p className="text-2xl font-bold">{stats.draft}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">In Progress</p>
            <p className="text-2xl font-bold">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Design Ready</p>
            <p className="text-2xl font-bold">{stats.designReady}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Quoted</p>
            <p className="text-2xl font-bold">{stats.quoted}</p>
          </div>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <ClipboardDocumentListIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No projects yet</p>
            <p className="text-sm text-gray-500 mb-6">
              Create your first project to get started with interior design
            </p>
            <Link
              to="/customer/projects/create"
              className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create New Project
            </Link>
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
                      {getStatusText(project.status)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {project.description || 'No description provided'}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{project.measurements?.length || 0} areas</span>
                    <span>{project.images?.length || 0} photos</span>
                  </div>

                  <button
                    onClick={() => navigate(`/customer/projects/${project._id}`)}
                    className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    View Details
                  </button>

                  {project.status === 'DESIGN_COMPLETED' && (
                    <Link
                      to={`/customer/design-review/${project._id}`}
                      className="mt-2 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      Review Design
                    </Link>
                  )}

                  {project.status === 'quoted' && (
                    <Link
                      to={`/customer/quotations/${project.quotations?.[0]?._id}`}
                      className="mt-2 w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      View Quotation
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;