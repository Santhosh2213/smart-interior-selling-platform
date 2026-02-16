import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { invoiceService } from '../../services/invoiceService';
import { 
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  EnvelopeIcon,
  PrinterIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const InvoiceManagement = () => {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await invoiceService.getAllInvoices();
      setInvoices(response.data);
    } catch (error) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.order?.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = async (id) => {
    try {
      const response = await invoiceService.downloadInvoice(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Invoice downloaded');
    } catch (error) {
      toast.error('Failed to download invoice');
    }
  };

  const handleEmail = async (id) => {
    try {
      await invoiceService.emailInvoice(id);
      toast.success('Invoice sent to customer');
    } catch (error) {
      toast.error('Failed to send invoice');
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Invoice Management</h1>
        <p className="text-gray-600">Manage and send invoices to customers</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Invoices</p>
          <p className="text-2xl font-bold">{invoices.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Paid</p>
          <p className="text-2xl font-bold text-green-600">
            {invoices.filter(i => i.paymentStatus === 'paid').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {invoices.filter(i => i.paymentStatus === 'pending').length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search invoices by number, customer or order..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredInvoices.map((invoice) => (
              <tr key={invoice._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">
                    {invoice.invoiceNumber}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">
                    {invoice.order?.orderNumber}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{invoice.customer?.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    {new Date(invoice.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    ₹{invoice.total?.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                    invoice.paymentStatus === 'paid' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {invoice.paymentStatus === 'paid' ? (
                      <CheckCircleIcon className="h-3 w-3 mr-1" />
                    ) : (
                      <ClockIcon className="h-3 w-3 mr-1" />
                    )}
                    {invoice.paymentStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link
                    to={`/seller/invoice/${invoice._id}`}
                    className="text-primary-600 hover:text-primary-900 mr-3"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDownload(invoice._id)}
                    className="text-primary-600 hover:text-primary-900 mr-3"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEmail(invoice._id)}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    <EnvelopeIcon className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No invoices found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceManagement;