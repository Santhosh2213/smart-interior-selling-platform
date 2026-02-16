import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { designerService } from '../../services/designerService';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  UserIcon,
  CalendarIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/common/Loader';
import ConsultationCard from '../../components/designer/ConsultationCard';
import FilterModal from '../../components/modals/FilterModal';
import toast from 'react-hot-toast';

const ConsultationQueue = () => {
  const [loading, setLoading] = useState(true);
  const [consultations, setConsultations] = useState([]);
  const [filteredConsultations, setFilteredConsultations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    fetchConsultations();
  }, []);

  useEffect(() => {
    filterConsultations();
  }, [searchQuery, filters, consultations]);

  const fetchConsultations = async () => {
    try {
      const response = await designerService.getConsultations();
      setConsultations(response.data);
      setFilteredConsultations(response.data);
    } catch (error) {
      toast.error('Failed to load consultations');
    } finally {
      setLoading(false);
    }
  };

  const filterConsultations = () => {
    let filtered = [...consultations];

    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.project?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.status?.length) {
      filtered = filtered.filter(c => filters.status.includes(c.status));
    }

    setFilteredConsultations(filtered);
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
        <h1 className="text-2xl font-bold text-gray-900">Consultation Queue</h1>
        <p className="text-gray-600">Review and respond to customer consultation requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Consultations</p>
          <p className="text-2xl font-bold">{consultations.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {consultations.filter(c => c.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-green-600">
            {consultations.filter(c => c.status === 'completed').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search consultations..."
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
        </button>
      </div>

      {/* Consultations Grid */}
      {filteredConsultations.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <ChatBubbleLeftIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No consultations</h3>
          <p className="text-gray-600">New consultation requests will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConsultations.map((consultation) => (
            <ConsultationCard key={consultation._id} consultation={consultation} />
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

export default ConsultationQueue;