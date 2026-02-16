import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sellerService } from '../../services/sellerService';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/common/Loader';
import ProjectQueueCard from '../../components/seller/ProjectQueueCard';
import FilterModal from '../../components/modals/FilterModal';
import toast from 'react-hot-toast';

const ProjectQueue = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [searchQuery, filters, projects]);

  const fetchProjects = async () => {
    try {
      const response = await sellerService.getProjectQueue();
      setProjects(response.data);
      setFilteredProjects(response.data);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = [...projects];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filters.status?.length) {
      filtered = filtered.filter(p => filters.status.includes(p.status));
    }

    // Date filter
    if (filters.startDate) {
      filtered = filtered.filter(p => new Date(p.createdAt) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      filtered = filtered.filter(p => new Date(p.createdAt) <= new Date(filters.endDate));
    }

    setFilteredProjects(filtered);
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Project Queue</h1>
        <p className="text-gray-600">Manage incoming project requests</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects or customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
        
        <button
          onClick={() => setShowFilters(true)}
          className="btn-secondary flex items-center justify-center"
        >
          <FunnelIcon className="h-4 w-4 mr-1" />
          Filters
          {Object.keys(filters).length > 0 && (
            <span className="ml-2 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {Object.keys(filters).length}
            </span>
          )}
        </button>
      </div>

      {/* Queue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Pending</p>
          <p className="text-2xl font-bold">{projects.filter(p => p.status === 'pending').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">In Progress</p>
          <p className="text-2xl font-bold">{projects.filter(p => p.status === 'quoting').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Quoted</p>
          <p className="text-2xl font-bold">{projects.filter(p => p.status === 'quoted').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-2xl font-bold">{projects.filter(p => p.status === 'completed').length}</p>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <ClockIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects in queue</h3>
          <p className="text-gray-600">New projects will appear here when customers submit them.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectQueueCard key={project._id} project={project} />
          ))}
        </div>
      )}

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onApply={(newFilters) => {
          setFilters(newFilters);
          setShowFilters(false);
        }}
      />
    </div>
  );
};

export default ProjectQueue;