import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sellerService } from '../../services/sellerService';
import { 
  FolderIcon, 
  DocumentTextIcon, 
  CurrencyRupeeIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import SalesChart from '../../components/charts/SalesChart';
import RevenueChart from '../../components/charts/RevenueChart';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const SellerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    pendingQuotations: 0,
    totalCustomers: 0,
    monthlyRevenue: 0,
    recentProjects: [],
    recentQuotations: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await sellerService.getDashboardStats();
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
      title: 'Total Projects',
      value: stats.totalProjects,
      icon: FolderIcon,
      color: 'bg-blue-500',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Pending Quotes',
      value: stats.pendingQuotations,
      icon: ClockIcon,
      color: 'bg-yellow-500',
      change: '-5%',
      trend: 'down'
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: UsersIcon,
      color: 'bg-green-500',
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'Monthly Revenue',
      value: `₹${stats.monthlyRevenue?.toLocaleString()}`,
      icon: CurrencyRupeeIcon,
      color: 'bg-purple-500',
      change: '+15%',
      trend: 'up'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className={`flex items-center text-sm ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend === 'up' ? (
                    <ArrowUpIcon className="h-4 w-4" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4" />
                  )}
                  <span>{stat.change}</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-sm text-gray-600">{stat.title}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <SalesChart />
        <RevenueChart />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Projects</h2>
            <Link to="/seller/project-queue" className="text-sm text-primary-600 hover:text-primary-700">
              View All
            </Link>
          </div>
          
          <div className="space-y-4">
            {stats.recentProjects.map((project) => (
              <div key={project._id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{project.title}</p>
                  <p className="text-sm text-gray-600">
                    {project.customer?.name} • {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  {project.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Quotations */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Quotations</h2>
            <Link to="/seller/quotations" className="text-sm text-primary-600 hover:text-primary-700">
              View All
            </Link>
          </div>
          
          <div className="space-y-4">
            {stats.recentQuotations.map((quote) => (
              <div key={quote._id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">#{quote.quotationNumber}</p>
                  <p className="text-sm text-gray-600">
                    ₹{quote.total?.toLocaleString()} • {quote.customer?.name}
                  </p>
                </div>
                <span className={`text-sm px-2 py-1 rounded ${
                  quote.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  quote.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {quote.status}
                </span>
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
            to="/seller/project-queue"
            className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition-shadow"
          >
            <FolderIcon className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <span className="text-sm font-medium">View Queue</span>
          </Link>
          
          <Link
            to="/seller/materials"
            className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition-shadow"
          >
            <DocumentTextIcon className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <span className="text-sm font-medium">Materials</span>
          </Link>
          
          <Link
            to="/seller/gst-settings"
            className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition-shadow"
          >
            <CurrencyRupeeIcon className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <span className="text-sm font-medium">GST Settings</span>
          </Link>
          
          <Link
            to="/seller/reports"
            className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition-shadow"
          >
            <UsersIcon className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <span className="text-sm font-medium">Reports</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;