import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { designerService } from '../../services/designerService';
import { 
  FolderIcon, 
  ChatBubbleLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  PaintBrushIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const DesignerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalConsultations: 0,
    pendingConsultations: 0,
    completedConsultations: 0,
    activeProjects: 0,
    recentConsultations: [],
    recentSuggestions: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await designerService.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Consultations',
      value: stats.totalConsultations,
      icon: ChatBubbleLeftIcon,
      color: 'bg-blue-500'
    },
    {
      title: 'Pending',
      value: stats.pendingConsultations,
      icon: ClockIcon,
      color: 'bg-yellow-500'
    },
    {
      title: 'Completed',
      value: stats.completedConsultations,
      icon: CheckCircleIcon,
      color: 'bg-green-500'
    },
    {
      title: 'Active Projects',
      value: stats.activeProjects,
      icon: PaintBrushIcon,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Designer Dashboard</h1>
        <p className="text-gray-600">Manage your consultations and design suggestions</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className={`p-3 rounded-lg ${stat.color} inline-block mb-4`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-sm text-gray-600">{stat.title}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Consultations */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Consultations</h2>
            <Link to="/designer/consultations" className="text-sm text-primary-600 hover:text-primary-700">
              View All
            </Link>
          </div>
          
          <div className="space-y-4">
            {stats.recentConsultations.map((consultation) => (
              <div key={consultation._id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{consultation.project?.title}</p>
                  <p className="text-sm text-gray-600">
                    {consultation.customer?.name} • {new Date(consultation.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  Pending
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Suggestions */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Your Suggestions</h2>
            <Link to="/designer/suggestions" className="text-sm text-primary-600 hover:text-primary-700">
              View All
            </Link>
          </div>
          
          <div className="space-y-4">
            {stats.recentSuggestions.map((suggestion) => (
              <div key={suggestion._id} className="border-b last:border-0 pb-3 last:pb-0">
                <p className="font-medium text-gray-900">{suggestion.title}</p>
                <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  For: {suggestion.project?.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/designer/consultations"
            className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition-shadow"
          >
            <ChatBubbleLeftIcon className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <span className="text-sm font-medium">Consultations</span>
          </Link>
          
          <Link
            to="/designer/projects"
            className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition-shadow"
          >
            <FolderIcon className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <span className="text-sm font-medium">Projects</span>
          </Link>
          
          <Link
            to="/designer/suggestions"
            className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition-shadow"
          >
            <PaintBrushIcon className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <span className="text-sm font-medium">Suggestions</span>
          </Link>
          
          <Link
            to="/chat"
            className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition-shadow"
          >
            <UserGroupIcon className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <span className="text-sm font-medium">Messages</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DesignerDashboard;