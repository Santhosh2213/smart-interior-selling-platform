import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCustomerProjects } from '../../services/projectService';
import { 
  PlusIcon, 
  ClipboardDocumentListIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ChartBarIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  HomeModernIcon,
  PhotoIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { 
  PieChart, Pie, Cell, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const CustomerDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('month');
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

  // Calculate statistics
  const stats = {
    total: projects.length,
    draft: projects.filter(p => p.status === 'draft').length,
    pending: projects.filter(p => p.status === 'pending' || p.status === 'PENDING_DESIGN').length,
    designReady: projects.filter(p => p.status === 'DESIGN_COMPLETED' || p.status === 'DESIGN_SUBMITTED').length,
    quoted: projects.filter(p => p.status === 'quoted' || p.status === 'DESIGN_APPROVED').length,
    completed: projects.filter(p => p.status === 'completed').length,
    rejected: projects.filter(p => p.status === 'DESIGN_REJECTED' || p.status === 'rejected').length
  };

  // Data for project status pie chart
  const statusData = [
    { name: 'Draft', value: stats.draft, color: '#9CA3AF' },
    { name: 'In Progress', value: stats.pending, color: '#F59E0B' },
    { name: 'Design Ready', value: stats.designReady, color: '#3B82F6' },
    { name: 'Quoted', value: stats.quoted, color: '#10B981' },
    { name: 'Completed', value: stats.completed, color: '#8B5CF6' },
    { name: 'Rejected', value: stats.rejected, color: '#EF4444' }
  ].filter(item => item.value > 0);

  // Generate timeline data (last 6 months)
  const getTimelineData = () => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthYear = date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      
      // Count projects created in this month
      const created = projects.filter(p => {
        const createdDate = new Date(p.createdAt);
        return createdDate.getMonth() === date.getMonth() && 
               createdDate.getFullYear() === date.getFullYear();
      }).length;
      
      // Count projects approved in this month
      const approved = projects.filter(p => {
        if (p.approvedAt) {
          const approvedDate = new Date(p.approvedAt);
          return approvedDate.getMonth() === date.getMonth() && 
                 approvedDate.getFullYear() === date.getFullYear();
        }
        return false;
      }).length;
      
      months.push({
        month: monthYear,
        created,
        approved,
        quoted: projects.filter(p => {
          if (p.quotedAt) {
            const quotedDate = new Date(p.quotedAt);
            return quotedDate.getMonth() === date.getMonth() && 
                   quotedDate.getFullYear() === date.getFullYear();
          }
          return false;
        }).length
      });
    }
    
    return months;
  };

  // Generate project progress data
  const getProgressData = () => {
    const stages = ['Draft', 'Design', 'Quoted', 'Completed'];
    const counts = [
      stats.draft,
      stats.pending + stats.designReady,
      stats.quoted,
      stats.completed
    ];
    
    return stages.map((stage, index) => ({
      stage,
      count: counts[index]
    }));
  };

  // Get recent activity
  const getRecentActivity = () => {
    const activities = [];
    
    projects.forEach(project => {
      if (project.createdAt) {
        activities.push({
          id: `create-${project._id}`,
          type: 'created',
          title: project.title,
          date: new Date(project.createdAt),
          icon: '📝',
          color: 'bg-blue-100'
        });
      }
      if (project.submittedAt) {
        activities.push({
          id: `submit-${project._id}`,
          type: 'submitted',
          title: project.title,
          date: new Date(project.submittedAt),
          icon: '🚀',
          color: 'bg-yellow-100'
        });
      }
      if (project.approvedAt) {
        activities.push({
          id: `approve-${project._id}`,
          type: 'approved',
          title: project.title,
          date: new Date(project.approvedAt),
          icon: '✅',
          color: 'bg-green-100'
        });
      }
      if (project.quotedAt) {
        activities.push({
          id: `quote-${project._id}`,
          type: 'quoted',
          title: project.title,
          date: new Date(project.quotedAt),
          icon: '💰',
          color: 'bg-purple-100'
        });
      }
    });
    
    return activities.sort((a, b) => b.date - a.date).slice(0, 10);
  };

  // Calculate average time from submission to quotation
  const getAverageTimeToQuote = () => {
    const quotedProjects = projects.filter(p => p.submittedAt && p.quotedAt);
    if (quotedProjects.length === 0) return 0;
    
    const totalDays = quotedProjects.reduce((sum, p) => {
      const submitted = new Date(p.submittedAt);
      const quoted = new Date(p.quotedAt);
      const days = Math.ceil((quoted - submitted) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);
    
    return Math.round(totalDays / quotedProjects.length);
  };

  const recentActivity = getRecentActivity();
  const timelineData = getTimelineData();
  const progressData = getProgressData();
  const avgTimeToQuote = getAverageTimeToQuote();

  const getStatusColor = (status) => {
    switch(status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending':
      case 'PENDING_DESIGN': return 'bg-yellow-100 text-yellow-800';
      case 'DESIGN_COMPLETED':
      case 'DESIGN_SUBMITTED': return 'bg-blue-100 text-blue-800';
      case 'quoted':
      case 'DESIGN_APPROVED': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'DESIGN_REJECTED':
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'draft': return 'Draft';
      case 'pending': return 'Pending';
      case 'PENDING_DESIGN': return 'Design Pending';
      case 'DESIGN_COMPLETED':
      case 'DESIGN_SUBMITTED': return 'Design Ready';
      case 'quoted': return 'Quoted';
      case 'DESIGN_APPROVED': return 'Design Approved';
      case 'completed': return 'Completed';
      case 'DESIGN_REJECTED': return 'Design Rejected';
      case 'rejected': return 'Rejected';
      default: return status;
    }
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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
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
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-bold">{stats.completed}</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Project Status Pie Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2 text-blue-500" />
              Project Status Distribution
            </h2>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-12">No project data available</p>
            )}
          </div>

          {/* Timeline Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-blue-500" />
                Project Timeline
              </h2>
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="text-sm border rounded-lg px-2 py-1"
              >
                <option value="month">Last 6 Months</option>
                <option value="year">Last Year</option>
              </select>
            </div>
            {timelineData.length > 0 && timelineData.some(d => d.created > 0 || d.approved > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="created" stroke="#3B82F6" name="Created" />
                  <Line type="monotone" dataKey="approved" stroke="#10B981" name="Approved" />
                  <Line type="monotone" dataKey="quoted" stroke="#8B5CF6" name="Quoted" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-12">No timeline data available</p>
            )}
          </div>
        </div>

        {/* Progress Bar Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <ArrowTrendingUpIcon className="h-5 w-5 mr-2 text-blue-500" />
            Project Progress
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Projects Grid with Images */}
        <h2 className="text-xl font-bold mb-4">Your Projects</h2>
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
            {projects.map((project) => {
              // Get first image or use placeholder
              const firstImage = project.images && project.images.length > 0 
                ? project.images[0].imageUrl 
                : 'https://via.placeholder.com/400x200?text=No+Image';
              
              return (
                <div key={project._id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Project Image */}
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={firstImage} 
                      alt={project.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                        {getStatusText(project.status)}
                      </span>
                    </div>
                    <div className="absolute bottom-2 left-2 flex items-center space-x-2">
                      <div className="flex items-center bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        <PhotoIcon className="h-3 w-3 mr-1" />
                        {project.images?.length || 0}
                      </div>
                      <div className="flex items-center bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        <HomeModernIcon className="h-3 w-3 mr-1" />
                        {project.measurements?.length || 0}
                      </div>
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                      {project.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {project.description || 'No description provided'}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>Created: {new Date(project.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="text-gray-600">
                          {project.status === 'completed' ? '100%' :
                           project.status === 'quoted' ? '75%' :
                           project.status === 'DESIGN_COMPLETED' ? '50%' :
                           project.status === 'pending' ? '25%' : '0%'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: project.status === 'completed' ? '100%' :
                                   project.status === 'quoted' ? '75%' :
                                   project.status === 'DESIGN_COMPLETED' ? '50%' :
                                   project.status === 'pending' ? '25%' : '0%'
                          }}
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/customer/projects/${project._id}`)}
                        className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center text-sm"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View Details
                      </button>
                      
                      {(project.status === 'DESIGN_COMPLETED' || project.status === 'DESIGN_SUBMITTED') && (
                        <Link
                          to={`/customer/design-review/${project._id}`}
                          className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-sm"
                        >
                          Review Design
                        </Link>
                      )}

                      {project.status === 'quoted' && project.quotations?.[0] && (
                        <Link
                          to={`/customer/quotations/${project.quotations[0]._id}`}
                          className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center text-sm"
                        >
                          View Quote
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Recent Activity Section */}
        {recentActivity.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2 text-blue-500" />
              Recent Activity
            </h2>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 border-b pb-3 last:border-0">
                  <div className={`${activity.color} p-2 rounded-full`}>
                    <span className="text-sm">{activity.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.title}</span> - {activity.type}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.date.toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'short', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Average Time to Quote</h3>
            <p className="text-3xl font-bold">{avgTimeToQuote} days</p>
            <p className="text-sm text-blue-100 mt-2">From submission to quotation</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Completion Rate</h3>
            <p className="text-3xl font-bold">
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
            </p>
            <p className="text-sm text-purple-100 mt-2">Projects completed</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Active Projects</h3>
            <p className="text-3xl font-bold">{stats.pending + stats.designReady}</p>
            <p className="text-sm text-green-100 mt-2">Currently in progress</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;