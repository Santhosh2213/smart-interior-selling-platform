import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  getDesignerQueue, 
  getSuggestionHistory,
  getMaterials 
} from '../../services/designerService';
import Loader from '../../components/common/Loader';
import ConsultationCard from '../../components/designer/ConsultationCard';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  CubeIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [pendingProjects, setPendingProjects] = useState([]);
  const [recentSuggestions, setRecentSuggestions] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    completed: 0,
    totalMaterials: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time refresh every 30 seconds
    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [projects, suggestions, materialsData] = await Promise.all([
        getDesignerQueue(),
        getSuggestionHistory(),
        getMaterials()
      ]);
      
      setPendingProjects(projects || []);
      setRecentSuggestions(suggestions || []);
      setMaterials(materialsData || []);
      
      setStats({
        pending: projects?.length || 0,
        completed: suggestions?.filter(s => s.status === 'APPROVED')?.length || 0,
        totalMaterials: materialsData?.length || 0
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Designer Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your design overview.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Pending Projects */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <Link 
              to="/designer/queue" 
              className="mt-4 inline-flex items-center text-sm text-yellow-600 hover:text-yellow-700"
            >
              View Queue <ArrowRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {/* Completed Designs */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Designs</p>
                <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <Link 
              to="/designer/suggestions" 
              className="mt-4 inline-flex items-center text-sm text-green-600 hover:text-green-700"
            >
              View History <ArrowRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {/* Materials Database */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Materials Available</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalMaterials}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <CubeIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <Link 
              to="/designer/materials" 
              className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
            >
              Browse Materials <ArrowRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>

        {/* Pending Projects List */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Pending Reviews</h2>
          </div>
          <div className="p-6">
            {pendingProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingProjects.map((project) => (
                  <ConsultationCard
                    key={project._id}
                    project={project}
                    onClick={() => navigate(`/designer/consultation/${project._id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No pending projects
              </div>
            )}
          </div>
        </div>

        {/* Recent Suggestions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Suggestions</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentSuggestions.length > 0 ? (
              recentSuggestions.slice(0, 5).map((suggestion) => (
                <div key={suggestion._id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {suggestion.projectId?.title || 'Project'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Submitted: {new Date(suggestion.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Materials: {suggestion.recommendations?.length || 0}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      suggestion.status === 'APPROVED' 
                        ? 'bg-green-100 text-green-800'
                        : suggestion.status === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {suggestion.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                No suggestions yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;