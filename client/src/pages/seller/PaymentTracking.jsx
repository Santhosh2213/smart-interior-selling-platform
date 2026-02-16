import React, { useState, useEffect } from 'react';
import { paymentService } from '../../services/paymentService';
import { 
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  BanknotesIcon,
  CreditCardIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const PaymentTracking = () => {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    totalAmount: 0
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await paymentService.getAllPayments();
      setPayments(response.data);
      
      // Calculate stats
      const stats = {
        total: response.data.length,
        completed: response.data.filter(p => p.status === 'completed').length,
        pending: response.data.filter(p => p.status === 'pending').length,
        failed: response.data.filter(p => p.status === 'failed').length,
        totalAmount: response.data
          .filter(p => p.status === 'completed')
          .reduce((sum, p) => sum + p.amount, 0)
      };
      setStats(stats);
    } catch (error) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentIcon = (method) => {
    switch(method) {
      case 'card': return <CreditCardIcon className="h-4 w-4" />;
      case 'upi': return <QrCodeIcon className="h-4 w-4" />;
      case 'netbanking': return <BanknotesIcon className="h-4 w-4" />;
      default: return <BanknotesIcon className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'pending': return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'failed': return <XCircleIcon className="h-4 w-4 text-red-500" />;
      default: return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPayments = payments.filter(p => 
    p.transactionId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.order?.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <h1 className="text-2xl font-bold text-gray-900">Payment Tracking</h1>
        <p className="text-gray-600">Monitor all payment transactions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Transactions</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Failed</p>
          <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Amount</p>
          <p className="text-2xl font-bold text-primary-600">₹{stats.totalAmount.toLocaleString()}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by transaction ID, customer or order..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPayments.map((payment) => (
              <tr key={payment._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">
                    {payment.transactionId}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{payment.customer?.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">
                    {payment.order?.orderNumber}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-600">
                    {getPaymentIcon(payment.method)}
                    <span className="ml-1 capitalize">{payment.method}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    ₹{payment.amount?.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                    {getStatusIcon(payment.status)}
                    <span className="ml-1 capitalize">{payment.status}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <BanknotesIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No payments found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentTracking;