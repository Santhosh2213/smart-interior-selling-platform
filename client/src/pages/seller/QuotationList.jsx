import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sellerService } from '../../services/sellerService';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/common/Loader';
import FilterModal from '../../components/modals/FilterModal';
import toast from 'react-hot-toast';

const QuotationList = () => {
  const [loading, setLoading] = useState(true);
  const [quotations, setQuotations] = useState([]);
  const [filteredQuotations, setFilteredQuotations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    fetchQuotations();
  }, []);

  useEffect(() => {
    filterQuotations();
  }, [searchQuery, filters, quotations]);

  const fetchQuotations = async () => {
    try {
      const response = await sellerService.getQuotations();
      setQuotations(response.data);
      setFilteredQuotations(response.data);
    } catch (error) {
      toast.error('Failed to load quotations');
    } finally {
      setLoading(false);
    }
  };

  const filterQuotations = () => {
    let filtered = [...quotations];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(q => 
        q.quotationNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.project?.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filters.status?.length) {
      filtered = filtered.filter(q => filters.status.includes(q.status));
    }

    // Date filter
    if (filters.startDate) {
      filtered = filtered.filter(q => new Date(q.createdAt) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      filtered = filtered.filter(q => new Date(q.createdAt) <= new Date(filters.endDate));
    }

    setFilteredQuotations(filtered);
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'draft': return <DocumentTextIcon className="h-4 w-4" />;
      case 'sent': return <ClockIcon className="h-4 w-4" />;
      case 'viewed': return <EyeIcon className="h-4 w-4" />;
      case 'accepted': return <CheckCircleIcon className="h-4 w-4" />;
      case 'rejected': return <XCircleIcon className="h-4 w-4" />;
      default: return <DocumentTextIcon className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'viewed': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotations</h1>
          <p className="text-gray-600">Manage all your quotations</p>
        </div>
        <Link to="/seller/project-queue" className="btn-primary">
          Create New Quotation
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search quotations..."
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

      {/* Quotations Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quote #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredQuotations.map((quote) => (
              <tr key={quote._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">
                    {quote.quotationNumber}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{quote.customer?.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{quote.project?.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    {new Date(quote.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    ₹{quote.total?.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(quote.status)}`}>
                    {getStatusIcon(quote.status)}
                    <span className="ml-1 capitalize">{quote.status}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link
                    to={`/seller/quotation/${quote._id}`}
                    className="text-primary-600 hover:text-primary-900 mr-3"
                  >
                    View
                  </Link>
                  {quote.status === 'draft' && (
                    <Link
                      to={`/seller/edit-quotation/${quote._id}`}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      Edit
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredQuotations.length === 0 && (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No quotations found</p>
          </div>
        )}
      </div>

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

export default QuotationList;