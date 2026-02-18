import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  DocumentTextIcon, 
  ClockIcon, 
  CheckCircleIcon,
  CurrencyRupeeIcon,
  ArrowPathIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { dashboardService } from '../../services/dashboardService';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const SellerDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalProjects: 0,
      pending: 0,
      inProgress: 0,
      quoted: 0,
      completed: 0,
      totalRevenue: 0
    },
    recentProjects: [],
    recentQuotations: []
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
      console.log('Fetching seller dashboard data...');
      
      const response = await dashboardService.getSellerDashboard();
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      quoting: { color: 'bg-blue-100 text-blue-800', label: 'In Progress' },
      quoted: { color: 'bg-purple-100 text-purple-800', label: 'Quoted' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' }
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
        <button
          onClick={fetchDashboardData}
          className="btn-secondary flex items-center"
          title="Refresh"
        >
          <ArrowPathIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Projects</p>
              <p className="text-3xl font-bold">{dashboardData.stats.totalProjects}</p>
            </div>
            <DocumentTextIcon className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-3xl font-bold">{dashboardData.stats.pending}</p>
            </div>
            <ClockIcon className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-3xl font-bold">{dashboardData.stats.inProgress}</p>
            </div>
            <ArrowPathIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Quoted</p>
              <p className="text-3xl font-bold">{dashboardData.stats.quoted}</p>
            </div>
            <DocumentTextIcon className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-3xl font-bold">{dashboardData.stats.completed}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold">{formatCurrency(dashboardData.stats.totalRevenue)}</p>
            </div>
            <CurrencyRupeeIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          to="/seller/project-queue"
          className="bg-primary-50 p-6 rounded-lg hover:bg-primary-100 transition-colors"
        >
          <h3 className="font-semibold text-primary-900 mb-2">Project Queue</h3>
          <p className="text-sm text-primary-700">View and manage incoming projects</p>
          {dashboardData.stats.pending > 0 && (
            <span className="mt-2 inline-flex items-center px-2 py-1 bg-primary-600 text-white text-xs font-medium rounded-full">
              {dashboardData.stats.pending} pending
            </span>
          )}
        </Link>

        <Link
          to="/seller/quotations"
          className="bg-blue-50 p-6 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <h3 className="font-semibold text-blue-900 mb-2">Quotations</h3>
          <p className="text-sm text-blue-700">Create and manage quotations</p>
          {dashboardData.stats.quoted > 0 && (
            <span className="mt-2 inline-flex items-center px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
              {dashboardData.stats.quoted} active
            </span>
          )}
        </Link>

        <Link
          to="/seller/materials"
          className="bg-green-50 p-6 rounded-lg hover:bg-green-100 transition-colors"
        >
          <h3 className="font-semibold text-green-900 mb-2">Materials</h3>
          <p className="text-sm text-green-700">Manage material database</p>
        </Link>
      </div>

      {/* Recent Projects */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Projects</h2>
          <Link to="/seller/project-queue" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All
          </Link>
        </div>

        {dashboardData.recentProjects.length > 0 ? (
          <div className="space-y-4">
            {dashboardData.recentProjects.map((project) => (
              <div key={project._id} className="flex items-center justify-between border-b pb-4 last:border-0">
                <div>
                  <h3 className="font-medium text-gray-900">{project.title}</h3>
                  <p className="text-sm text-gray-600">Customer: {project.customerName}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(project.status)}
                  <Link
                    to={`/seller/create-quotation/${project._id}`}
                    className="btn-primary text-sm px-3 py-1"
                  >
                    Create Quote
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No recent projects</p>
            <p className="text-sm text-gray-400 mt-1">
              Projects will appear here when customers submit them
            </p>
          </div>
        )}
      </div>

      {/* Recent Quotations */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Quotations</h2>
          <Link to="/seller/quotations" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All
          </Link>
        </div>

        {dashboardData.recentQuotations.length > 0 ? (
          <div className="space-y-4">
            {dashboardData.recentQuotations.map((quote) => (
              <div key={quote._id} className="flex items-center justify-between border-b pb-4 last:border-0">
                <div>
                  <h3 className="font-medium text-gray-900">{quote.quotationNumber}</h3>
                  <p className="text-sm text-gray-600">{quote.projectTitle}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(quote.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-gray-900">
                    {formatCurrency(quote.total)}
                  </span>
                  {getStatusBadge(quote.status)}
                  <Link
                    to={`/seller/quotations/${quote._id}`}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No quotations yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Create your first quotation from the project queue
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;