import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSellerQuotations } from '../../services/quotationService';
import { 
  DocumentTextIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon,
  CurrencyRupeeIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const QuotationList = () => {
  const [quotations, setQuotations] = useState([]);
  const [filteredQuotations, setFilteredQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadQuotations();
  }, []);

  useEffect(() => {
    filterQuotations();
  }, [filter, quotations]);

  const loadQuotations = async () => {
    try {
      setLoading(true);
      const response = await getSellerQuotations();
      setQuotations(response.data || []);
      setFilteredQuotations(response.data || []);
    } catch (error) {
      console.error('Error loading quotations:', error);
      toast.error('Failed to load quotations');
    } finally {
      setLoading(false);
    }
  };

  const filterQuotations = () => {
    if (filter === 'all') {
      setFilteredQuotations(quotations);
    } else {
      setFilteredQuotations(quotations.filter(q => q.status === filter));
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sent':
      case 'viewed':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'changes_requested':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'draft':
        return <DocumentTextIcon className="h-4 w-4" />;
      case 'sent':
      case 'viewed':
        return <ClockIcon className="h-4 w-4" />;
      case 'accepted':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'rejected':
        return <XCircleIcon className="h-4 w-4" />;
      case 'changes_requested':
        return <ClockIcon className="h-4 w-4" />;
      default:
        return <DocumentTextIcon className="h-4 w-4" />;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Quotations</h1>
          <p className="text-gray-600">Manage and track your quotations</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'draft', 'sent', 'accepted', 'rejected', 'changes_requested'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All' : status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Quotations List */}
        {filteredQuotations.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No quotations found</p>
            <p className="text-sm text-gray-500">
              {filter !== 'all' 
                ? `No ${filter.replace('_', ' ')} quotations` 
                : 'Create your first quotation from the project queue'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quotation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredQuotations.map((quotation) => (
                    <tr key={quotation._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          #{quotation.quotationNumber}
                        </div>
                        <div className="text-xs text-gray-500">
                          v{quotation.version || 1}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">
                            {quotation.customerId?.name || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {quotation.projectId?.title || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(quotation.total)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(quotation.status)}`}>
                          {getStatusIcon(quotation.status)}
                          <span className="ml-1 capitalize">
                            {quotation.status.replace('_', ' ')}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {formatDate(quotation.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => navigate(`/seller/quotations/${quotation._id}`)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm inline-flex items-center"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuotationList;