import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invoiceService } from '../../services/invoiceService';
import { 
  ArrowLeftIcon, 
  DocumentArrowDownIcon,
  PrinterIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const InvoiceView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const response = await invoiceService.getInvoiceById(id);
      setInvoice(response.data);
    } catch (error) {
      toast.error('Failed to fetch invoice');
      navigate('/customer/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await invoiceService.downloadInvoice(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoice.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Invoice downloaded');
    } catch (error) {
      toast.error('Failed to download invoice');
    }
  };

  const handleEmail = async () => {
    try {
      await invoiceService.emailInvoice(id);
      toast.success('Invoice sent to your email');
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
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/customer/dashboard')}
            className="mr-4 text-gray-600 hover:text-primary-600"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoice</h1>
            <p className="text-gray-600">#{invoice?.invoiceNumber}</p>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleDownload}
            className="btn-secondary flex items-center"
          >
            <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
            Download
          </button>
          <button
            onClick={() => window.print()}
            className="btn-secondary flex items-center"
          >
            <PrinterIcon className="h-4 w-4 mr-1" />
            Print
          </button>
          <button
            onClick={handleEmail}
            className="btn-secondary flex items-center"
          >
            <EnvelopeIcon className="h-4 w-4 mr-1" />
            Email
          </button>
        </div>
      </div>

      {/* Invoice */}
      <div className="bg-white rounded-lg shadow p-8 print:shadow-none">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">INVOICE</h2>
            <p className="text-sm text-gray-600 mt-1">#{invoice?.invoiceNumber}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-lg">{invoice?.seller?.businessName}</p>
            <p className="text-sm text-gray-600">GST: {invoice?.seller?.gstin}</p>
            <p className="text-sm text-gray-600">{invoice?.seller?.businessAddress?.addressLine1}</p>
            <p className="text-sm text-gray-600">
              {invoice?.seller?.businessAddress?.city}, {invoice?.seller?.businessAddress?.state} - {invoice?.seller?.businessAddress?.pincode}
            </p>
          </div>
        </div>

        {/* Dates */}
        <div className="flex justify-between mb-8">
          <div>
            <p className="text-sm text-gray-600">Invoice Date:</p>
            <p className="font-medium">{new Date(invoice?.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Due Date:</p>
            <p className="font-medium">{new Date(invoice?.dueDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Order ID:</p>
            <p className="font-medium">{invoice?.order?.orderNumber}</p>
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Bill To:</h3>
          <p className="font-medium">{invoice?.customer?.userId?.name}</p>
          <p className="text-sm text-gray-600">{invoice?.customer?.addresses?.[0]?.addressLine1}</p>
          <p className="text-sm text-gray-600">
            {invoice?.customer?.addresses?.[0]?.city}, {invoice?.customer?.addresses?.[0]?.state} - {invoice?.customer?.addresses?.[0]?.pincode}
          </p>
          <p className="text-sm text-gray-600 mt-1">GST: {invoice?.customer?.gstin || 'N/A'}</p>
        </div>

        {/* Items */}
        <table className="w-full mb-8">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">GST</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invoice?.items?.map((item, index) => (
              <tr key={index}>
                <td className="px-4 py-3 text-sm">{item.materialName}</td>
                <td className="px-4 py-3 text-sm">{item.quantity}</td>
                <td className="px-4 py-3 text-sm">{item.unit}</td>
                <td className="px-4 py-3 text-sm">₹{item.pricePerUnit}</td>
                <td className="px-4 py-3 text-sm">{item.gstRate}%</td>
                <td className="px-4 py-3 text-sm text-right">₹{item.total?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-600">Subtotal:</span>
              <span className="text-sm font-medium">₹{invoice?.subtotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-600">GST Total:</span>
              <span className="text-sm font-medium">₹{invoice?.gstTotal?.toFixed(2)}</span>
            </div>
            {invoice?.laborCost > 0 && (
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-600">Labor Cost:</span>
                <span className="text-sm font-medium">₹{invoice?.laborCost?.toFixed(2)}</span>
              </div>
            )}
            {invoice?.transportCost > 0 && (
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-600">Transport:</span>
                <span className="text-sm font-medium">₹{invoice?.transportCost?.toFixed(2)}</span>
              </div>
            )}
            {invoice?.discount > 0 && (
              <div className="flex justify-between py-2 text-green-600">
                <span className="text-sm">Discount:</span>
                <span className="text-sm font-medium">-₹{invoice?.discount?.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between py-3 border-t border-gray-300 text-lg font-bold">
              <span>Total:</span>
              <span className="text-primary-600">₹{invoice?.total?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        <div className="border-t pt-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Payment Status:</p>
              <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                invoice?.paymentStatus === 'paid' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {invoice?.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
              </span>
            </div>
            {invoice?.paymentStatus === 'paid' && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Paid on: {new Date(invoice?.paidAt).toLocaleDateString()}</p>
                <p className="text-sm text-gray-600">Transaction ID: {invoice?.transactionId}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 border-t pt-6">
          <p>This is a computer generated invoice. No signature required.</p>
          <p className="mt-1">For any queries, please contact support@smartseller.com</p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;