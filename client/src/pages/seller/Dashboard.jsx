import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSellerDashboard } from '../../services/sellerService';
import { 
  ClipboardDocumentListIcon,
  CurrencyRupeeIcon,
  CubeIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
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
    recentProjects: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getSellerDashboard();
      console.log('Dashboard data received:', response);
      
      setDashboardData({
        stats: response.stats || {
          totalProjects: 0,
          pending: 0,
          inProgress: 0,
          quoted: 0,
          completed: 0,
          totalRevenue: 0
        },
        recentProjects: response.recentProjects || []
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const { stats, recentProjects } = dashboardData;

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your business overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Projects */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.totalProjects}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Total Projects</h3>
          </div>

          {/* Pending */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.pending}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Pending</h3>
          </div>

          {/* Quoted */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.quoted}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Quoted</h3>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <CurrencyRupeeIcon className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                ₹{stats.totalRevenue?.toLocaleString('en-IN') || 0}
              </span>
            </div>
            <h3 className="text-gray-600 font-medium">Total Revenue</h3>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Project Queue */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Queue Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Project Queue</h2>
                <Link 
                  to="/seller/queue" 
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                >
                  View All
                  <ArrowRightIcon className="h-4 w-4 ml-1" />
                </Link>
              </div>
              <p className="text-gray-600 mb-4">View and manage incoming projects</p>
              
              {recentProjects.length > 0 ? (
                <div className="space-y-4">
                  {recentProjects.map((project) => (
                    <div key={project._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{project.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          project.status === 'pending' || project.status === 'PENDING_DESIGN' 
                            ? 'bg-yellow-100 text-yellow-800'
                          : project.status === 'draft' 
                            ? 'bg-gray-100 text-gray-800'
                          : project.status === 'quoted' || project.status === 'DESIGN_APPROVED'
                            ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                        }`}>
                          {project.status === 'PENDING_DESIGN' ? 'Pending Design' : project.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Customer: {project.customerName || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500 mb-3">
                        Submitted: {new Date(project.createdAt).toLocaleDateString('en-IN')}
                      </p>
                      <Link
                        to={`/seller/quotations/create/${project._id}`}
                        className="inline-flex items-center text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Create Quote
                        <ArrowRightIcon className="h-4 w-4 ml-2" />
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No recent projects</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Projects will appear here when customers submit them
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  to="/seller/materials"
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                >
                  <CubeIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="font-medium text-gray-900">Manage Materials</p>
                  <p className="text-sm text-gray-500">Add or update materials</p>
                </Link>
                
                <Link
                  to="/seller/gst"
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                >
                  <DocumentTextIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="font-medium text-gray-900">GST Settings</p>
                  <p className="text-sm text-gray-500">Configure tax rates</p>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Info */}
          <div className="space-y-6">
            {/* Status Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Status</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">In Progress</span>
                  <span className="font-semibold">{stats.inProgress}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Quoted</span>
                  <span className="font-semibold">{stats.quoted}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-semibold">{stats.completed}</span>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900 font-medium">Total Revenue</span>
                    <span className="text-xl font-bold text-green-600">
                      ₹{stats.totalRevenue?.toLocaleString('en-IN') || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity - Static for now, can be dynamic later */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {recentProjects.length > 0 && (
                  <div className="flex items-start space-x-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <ClipboardDocumentListIcon className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">
                        New project: "{recentProjects[0]?.title}"
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(recentProjects[0]?.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <CubeIcon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">Materials ready for quotation</p>
                    <p className="text-xs text-gray-500">Browse materials to add</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Materials Summary */}
            <Link
              to="/seller/materials"
              className="block bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white hover:from-blue-600 hover:to-blue-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <CubeIcon className="h-8 w-8" />
                <ArrowRightIcon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Material Database</h3>
              <p className="text-sm text-blue-100">Manage your material inventory and pricing</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;