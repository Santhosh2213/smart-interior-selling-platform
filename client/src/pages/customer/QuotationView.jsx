import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quotationService } from '../../services/quotationService';
import { 
  ArrowLeftIcon, 
  DocumentArrowDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  PrinterIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const QuotationView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotation();
  }, [id]);

  const fetchQuotation = async () => {
    try {
      const response = await quotationService.getQuotationById(id);
      setQuotation(response.data);
    } catch (error) {
      toast.error('Failed to fetch quotation');
      navigate('/customer/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptQuote = async () => {
    try {
      await quotationService.acceptQuotation(id);
      toast.success('Quotation accepted successfully');
      fetchQuotation();
    } catch (error) {
      toast.error('Failed to accept quotation');
    }
  };

  const handleRejectQuote = async () => {
    try {
      await quotationService.rejectQuotation(id);
      toast.success('Quotation rejected');
      fetchQuotation();
    } catch (error) {
      toast.error('Failed to reject quotation');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await quotationService.downloadQuotationPDF(id);
      
      // Create blob and download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `quotation-${quotation.quotationNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', text: 'Draft' },
      sent: { color: 'bg-blue-100 text-blue-800', text: 'Sent' },
      viewed: { color: 'bg-yellow-100 text-yellow-800', text: 'Viewed' },
      accepted: { color: 'bg-green-100 text-green-800', text: 'Accepted' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' },
      expired: { color: 'bg-gray-100 text-gray-800', text: 'Expired' },
      revised: { color: 'bg-purple-100 text-purple-800', text: 'Revised' }
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Quotation not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/customer/dashboard')}
            className="mr-4 text-gray-600 hover:text-primary-600"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quotation Details</h1>
            <p className="text-gray-600">Quotation #{quotation.quotationNumber}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {quotation.status === 'sent' && (
            <>
              <button
                onClick={handleAcceptQuote}
                className="btn-primary flex items-center"
              >
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                Accept Quote
              </button>
              <button
                onClick={handleRejectQuote}
                className="btn-secondary flex items-center text-red-600 hover:text-red-700"
              >
                <XCircleIcon className="h-4 w-4 mr-1" />
                Reject
              </button>
            </>
          )}
          
          <button
            onClick={handleDownloadPDF}
            className="btn-secondary flex items-center"
          >
            <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
            PDF
          </button>
          
          <button className="btn-secondary flex items-center">
            <PrinterIcon className="h-4 w-4 mr-1" />
            Print
          </button>
          
          <button className="btn-secondary flex items-center">
            <ShareIcon className="h-4 w-4 mr-1" />
            Share
          </button>
        </div>
      </div>

      {/* Quotation Card */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Company Header */}
        <div className="bg-gray-50 px-8 py-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{quotation.sellerId?.businessName}</h2>
              <p className="text-gray-600 mt-1">GST: {quotation.sellerId?.gstin}</p>
              <p className="text-gray-600">{quotation.sellerId?.businessAddress?.addressLine1}</p>
              <p className="text-gray-600">
                {quotation.sellerId?.businessAddress?.city}, {quotation.sellerId?.businessAddress?.state} - {quotation.sellerId?.businessAddress?.pincode}
              </p>
            </div>
            <div className="text-right">
              {getStatusBadge(quotation.status)}
              <p className="text-sm text-gray-500 mt-2">Valid Until: {new Date(quotation.validUntil).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Customer & Project Info */}
        <div className="px-8 py-4 border-b bg-white">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Bill To:</h3>
              <p className="font-medium">{quotation.customerId?.userId?.name}</p>
              <p className="text-sm text-gray-600">{quotation.customerId?.addresses?.[0]?.addressLine1}</p>
              <p className="text-sm text-gray-600">
                {quotation.customerId?.addresses?.[0]?.city}, {quotation.customerId?.addresses?.[0]?.state}
              </p>
              <p className="text-sm text-gray-600 mt-1">Project: {quotation.projectId?.title}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Quote Date: {new Date(quotation.createdAt).toLocaleDateString()}</p>
              <p className="text-sm text-gray-600">Quote #: {quotation.quotationNumber}</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="px-8 py-6">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">GST %</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {quotation.items?.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-gray-900">{item.materialName}</div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">{item.quantity}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{item.unit}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">₹{item.pricePerUnit}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{item.gstRate}%</td>
                  <td className="px-4 py-4 text-sm text-gray-900 text-right">₹{item.total?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="px-8 py-6 bg-gray-50 border-t">
          <div className="flex justify-end">
            <div className="w-80">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">₹{quotation.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">GST Total:</span>
                <span className="font-medium">₹{quotation.gstTotal?.toFixed(2)}</span>
              </div>
              {quotation.laborCost > 0 && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Labor Cost:</span>
                  <span className="font-medium">₹{quotation.laborCost?.toFixed(2)}</span>
                </div>
              )}
              {quotation.transportCost > 0 && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Transport:</span>
                  <span className="font-medium">₹{quotation.transportCost?.toFixed(2)}</span>
                </div>
              )}
              {quotation.discount > 0 && (
                <div className="flex justify-between py-2 text-green-600">
                  <span>Discount ({quotation.discountType === 'percentage' ? `${quotation.discount}%` : 'Fixed'}):</span>
                  <span>-₹{(quotation.discountType === 'percentage' 
                    ? (quotation.subtotal + quotation.gstTotal) * (quotation.discount / 100)
                    : quotation.discount
                  ).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between py-3 border-t border-gray-300 text-lg font-bold">
                <span>Total Amount:</span>
                <span>₹{quotation.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Terms & Notes */}
        {(quotation.terms || quotation.notes) && (
          <div className="px-8 py-4 border-t">
            {quotation.terms && (
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Terms & Conditions:</h4>
                <p className="text-sm text-gray-600">{quotation.terms}</p>
              </div>
            )}
            {quotation.notes && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Notes:</h4>
                <p className="text-sm text-gray-600">{quotation.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Actions for Accepted/Rejected State */}
        {quotation.status === 'accepted' && (
          <div className="px-8 py-4 bg-green-50 border-t border-green-200">
            <div className="flex items-center text-green-800">
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              <span>You have accepted this quotation. The seller will contact you for further steps.</span>
            </div>
          </div>
        )}

        {quotation.status === 'rejected' && (
          <div className="px-8 py-4 bg-red-50 border-t border-red-200">
            <div className="flex items-center text-red-800">
              <XCircleIcon className="h-5 w-5 mr-2" />
              <span>You have rejected this quotation.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuotationView;