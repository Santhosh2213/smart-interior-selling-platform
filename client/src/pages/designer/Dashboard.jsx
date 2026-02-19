import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ClipboardDocumentListIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  UserGroupIcon,
  LightBulbIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { designerService } from '../../services/designerService'; // Fixed import path
import Loader from '../../components/common/Loader'; // Fixed import path
import toast from 'react-hot-toast';

const DesignerDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalConsultations: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      pendingReviews: 0,
      suggestionsMade: 0,
      approvedSuggestions: 0
    },
    recentProjects: [],
    designer: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching designer dashboard data...');
      
      const response = await designerService.getDashboard();
      console.log('Dashboard response:', response);
      
      if (response.success && response.data) {
        setDashboardData(response.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError(error.response?.data?.error || error.message || 'Failed to load dashboard data');
      toast.error(error.response?.data?.error || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending', icon: ClockIcon },
      quoting: { color: 'bg-blue-100 text-blue-800', label: 'In Progress', icon: ArrowPathIcon },
      quoted: { color: 'bg-purple-100 text-purple-800', label: 'Quoted', icon: ClipboardDocumentListIcon },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved', icon: CheckCircleIcon },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed', icon: CheckCircleIcon },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected', icon: ExclamationCircleIcon },
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft', icon: ClipboardDocumentListIcon }
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <ExclamationCircleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700 mb-2">Failed to Load Dashboard</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="btn-primary inline-flex items-center"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { stats, recentProjects, designer } = dashboardData;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Designer Dashboard</h1>
          <p className="text-gray-600">Welcome back, {designer?.name || 'Designer'}!</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="btn-secondary flex items-center"
          title="Refresh"
        >
          <ArrowPathIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Consultations</p>
              <p className="text-3xl font-bold">{stats?.totalConsultations || 0}</p>
            </div>
            <ClipboardDocumentListIcon className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Review</p>
              <p className="text-3xl font-bold">{stats?.pending || 0}</p>
            </div>
            <ClockIcon className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-3xl font-bold">{stats?.inProgress || 0}</p>
            </div>
            <ArrowPathIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-3xl font-bold">{stats?.completed || 0}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-primary-50 rounded-lg p-4">
          <p className="text-sm text-primary-700">Pending Reviews</p>
          <p className="text-2xl font-bold text-primary-900">{stats?.pendingReviews || 0}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-sm text-purple-700">Suggestions Made</p>
          <p className="text-2xl font-bold text-purple-900">{stats?.suggestionsMade || 0}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-green-700">Approved Suggestions</p>
          <p className="text-2xl font-bold text-green-900">{stats?.approvedSuggestions || 0}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link
          to="/designer/consultations"
          className="bg-primary-50 p-6 rounded-lg hover:bg-primary-100 transition-colors"
        >
          <h3 className="font-semibold text-primary-900 mb-2 flex items-center">
            <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
            Consultations
          </h3>
          <p className="text-sm text-primary-700">View and manage consultations</p>
          {stats?.pending > 0 && (
            <span className="mt-2 inline-flex items-center px-2 py-1 bg-primary-600 text-white text-xs font-medium rounded-full">
              {stats.pending} pending
            </span>
          )}
        </Link>

        <Link
          to="/designer/projects"
          className="bg-blue-50 p-6 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
            <UserGroupIcon className="h-5 w-5 mr-2" />
            All Projects
          </h3>
          <p className="text-sm text-blue-700">Browse all your projects</p>
          <span className="mt-2 inline-flex items-center px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
            {stats?.totalConsultations || 0} total
          </span>
        </Link>

        <Link
          to="/designer/suggestions"
          className="bg-purple-50 p-6 rounded-lg hover:bg-purple-100 transition-colors"
        >
          <h3 className="font-semibold text-purple-900 mb-2 flex items-center">
            <LightBulbIcon className="h-5 w-5 mr-2" />
            Suggestions
          </h3>
          <p className="text-sm text-purple-700">Your design suggestions</p>
          {stats?.suggestionsMade > 0 && (
            <span className="mt-2 inline-flex items-center px-2 py-1 bg-purple-600 text-white text-xs font-medium rounded-full">
              {stats.suggestionsMade} made
            </span>
          )}
        </Link>

        <Link
          to="/chat"
          className="bg-green-50 p-6 rounded-lg hover:bg-green-100 transition-colors"
        >
          <h3 className="font-semibold text-green-900 mb-2 flex items-center">
            <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
            Messages
          </h3>
          <p className="text-sm text-green-700">Chat with customers</p>
        </Link>
      </div>

      {/* Recent Consultations - This will now show your real project */}
<div className="bg-white rounded-lg shadow p-6 mb-8">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-lg font-semibold">Recent Consultations</h2>
    <Link to="/designer/consultations" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
      View All
    </Link>
  </div>

  {dashboardData.recentProjects && dashboardData.recentProjects.length > 0 ? (
    <div className="space-y-4">
      {dashboardData.recentProjects.map((project) => (
        <div key={project._id} className="flex items-center justify-between border-b pb-4 last:border-0 hover:bg-gray-50 p-2 rounded transition-colors">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h3 className="font-medium text-gray-900">{project.title}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                project.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                project.status === 'quoting' ? 'bg-blue-100 text-blue-800' :
                project.status === 'completed' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {project.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Customer: {project.customerName}</p>
            <div className="flex items-center space-x-4 mt-2">
              <p className="text-xs text-gray-500 flex items-center">
                <span className="font-medium mr-1">📸</span> {project.imageCount || 0} photos
              </p>
              <p className="text-xs text-gray-500">
                {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Link
            to={`/designer/consultation/${project._id}`}
            className="ml-4 btn-primary text-sm px-4 py-2 flex items-center"
          >
            <EyeIcon className="h-4 w-4 mr-1" />
            Review
          </Link>
        </div>
      ))}
    </div>
  ) : (
    <div className="text-center py-12">
      <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
      <p className="text-gray-500">No recent consultations</p>
      <p className="text-sm text-gray-400 mt-1">
        Projects assigned to you will appear here
      </p>
      {dashboardData.stats?.totalConsultations > 0 && (
        <p className="text-sm text-primary-600 mt-2">
          Total: {dashboardData.stats.totalConsultations} projects assigned
        </p>
      )}
    </div>
  )}
</div>
<div className="bg-gray-100 p-4 rounded-lg mb-4">
  <h3 className="font-bold">Debug Info:</h3>
  <p>Recent Projects Length: {dashboardData.recentProjects?.length}</p>
  <p>Stats Total: {dashboardData.stats?.totalConsultations}</p>
  <pre className="text-xs mt-2 bg-white p-2 rounded overflow-auto">
    {JSON.stringify(dashboardData.recentProjects, null, 2)}
  </pre>
</div>

      {/* Designer Info */}
      {designer?.specialization && designer.specialization.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Your Expertise</h2>
          <div className="flex flex-wrap gap-2">
            {designer.specialization.map((spec, index) => (
              <span key={index} className="px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full">
                {spec}
              </span>
            ))}
            {designer.experience > 0 && (
              <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                {designer.experience} years experience
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignerDashboard;