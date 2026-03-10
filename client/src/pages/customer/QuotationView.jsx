import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getQuotationById,
  acceptQuotation,
  rejectQuotation,
  requestQuotationChanges
} from '../../services/quotationService';
import { 
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  DocumentTextIcon,
  CurrencyRupeeIcon,
  CalendarIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const QuotationView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showChangeForm, setShowChangeForm] = useState(false);
  const [changeReason, setChangeReason] = useState('');

  useEffect(() => {
    loadQuotation();
  }, [id]);

  const loadQuotation = async () => {
    try {
      setLoading(true);
      const response = await getQuotationById(id);
      setQuotation(response.data);
    } catch (error) {
      console.error('Error loading quotation:', error);
      toast.error('Failed to load quotation');
      navigate('/customer/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!window.confirm('Are you sure you want to accept this quotation?')) return;
    
    setSubmitting(true);
    try {
      await acceptQuotation(id);
      toast.success('Quotation accepted successfully!');
      loadQuotation();
    } catch (error) {
      console.error('Error accepting quotation:', error);
      toast.error('Failed to accept quotation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    const reason = window.prompt('Please provide a reason for rejection:');
    if (!reason) return;
    
    setSubmitting(true);
    try {
      await rejectQuotation(id, reason);
      toast.success('Quotation rejected');
      loadQuotation();
    } catch (error) {
      console.error('Error rejecting quotation:', error);
      toast.error('Failed to reject quotation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestChanges = async (e) => {
    e.preventDefault();
    if (!changeReason.trim()) {
      toast.error('Please describe the changes you want');
      return;
    }

    setSubmitting(true);
    try {
      await requestQuotationChanges(id, { reason: changeReason });
      toast.success('Change request sent to seller');
      setShowChangeForm(false);
      setChangeReason('');
      loadQuotation();
    } catch (error) {
      console.error('Error requesting changes:', error);
      toast.error('Failed to send change request');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Quotation not found</p>
          <button
            onClick={() => navigate('/customer/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const canRespond = quotation.status === 'sent' || quotation.status === 'viewed';
  const isPending = quotation.status === 'sent' || quotation.status === 'viewed';
  const isAccepted = quotation.status === 'accepted';
  const isRejected = quotation.status === 'rejected';
  const changesRequested = quotation.status === 'changes_requested';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/customer/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Dashboard
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quotation #{quotation.quotationNumber}</h1>
              <p className="text-sm text-gray-500 mt-1">Project: {quotation.projectId?.title}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                isAccepted ? 'bg-green-100 text-green-800' :
                isRejected ? 'bg-red-100 text-red-800' :
                changesRequested ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {quotation.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Quotation Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Items</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Item</th>
                      <th className="text-right py-2">Qty</th>
                      <th className="text-right py-2">Unit Price</th>
                      <th className="text-right py-2">GST</th>
                      <th className="text-right py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotation.items.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3">
                          <p className="font-medium">{item.materialName}</p>
                          <p className="text-sm text-gray-500">{item.unit}</p>
                        </td>
                        <td className="text-right py-3">{item.quantity}</td>
                        <td className="text-right py-3">{formatCurrency(item.pricePerUnit)}</td>
                        <td className="text-right py-3">{item.gstRate}%</td>
                        <td className="text-right py-3 font-medium">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Terms & Notes */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-500" />
                Terms & Notes
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Terms & Conditions</h3>
                  <p className="text-gray-600 whitespace-pre-line">{quotation.terms}</p>
                </div>
                
                {quotation.notes && (
                  <div>
                    <h3 className="font-medium mb-2">Additional Notes</h3>
                    <p className="text-gray-600">{quotation.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Summary & Actions */}
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <CurrencyRupeeIcon className="h-5 w-5 mr-2" />
                Summary
              </h2>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(quotation.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST:</span>
                  <span>{formatCurrency(quotation.gstTotal)}</span>
                </div>
                {quotation.laborCost > 0 && (
                  <div className="flex justify-between">
                    <span>Labor:</span>
                    <span>{formatCurrency(quotation.laborCost)}</span>
                  </div>
                )}
                {quotation.transportCost > 0 && (
                  <div className="flex justify-between">
                    <span>Transport:</span>
                    <span>{formatCurrency(quotation.transportCost)}</span>
                  </div>
                )}
                {quotation.discount > 0 && (
                  <div className="flex justify-between text-yellow-200">
                    <span>Discount ({quotation.discountType === 'percentage' ? `${quotation.discount}%` : 'Fixed'}):</span>
                    <span>-{formatCurrency(quotation.discountAmount || (quotation.discountType === 'percentage' ? (quotation.subtotal + quotation.gstTotal) * (quotation.discount / 100) : quotation.discount))}</span>
                  </div>
                )}
                <div className="border-t border-white/30 my-2 pt-2">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(quotation.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Validity Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-3 flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-blue-500" />
                Validity
              </h3>
              <p className="text-gray-600">
                Valid until: {formatDate(quotation.validUntil)}
              </p>
              {new Date(quotation.validUntil) < new Date() && (
                <p className="text-sm text-red-600 mt-2">This quotation has expired</p>
              )}
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-3 flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-blue-500" />
                Customer Details
              </h3>
              <div className="space-y-2">
                <p className="flex items-center">
                  <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                  {quotation.customerId?.name || 'N/A'}
                </p>
                {quotation.customerId?.email && (
                  <p className="flex items-center">
                    <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                    {quotation.customerId.email}
                  </p>
                )}
                {quotation.customerId?.phone && (
                  <p className="flex items-center">
                    <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                    {quotation.customerId.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons - Only show if can respond */}
            {canRespond && (
              <div className="bg-white rounded-lg shadow p-6 space-y-4">
                {!showChangeForm ? (
                  <>
                    <button
                      onClick={handleAccept}
                      disabled={submitting}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                    >
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      Accept Quotation
                    </button>
                    
                    <button
                      onClick={() => setShowChangeForm(true)}
                      disabled={submitting}
                      className="w-full bg-yellow-600 text-white py-3 px-4 rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center justify-center"
                    >
                      <PencilIcon className="h-5 w-5 mr-2" />
                      Request Changes
                    </button>
                    
                    <button
                      onClick={handleReject}
                      disabled={submitting}
                      className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
                    >
                      <XCircleIcon className="h-5 w-5 mr-2" />
                      Reject Quotation
                    </button>
                  </>
                ) : (
                  <form onSubmit={handleRequestChanges} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Describe the changes you want
                      </label>
                      <textarea
                        value={changeReason}
                        onChange={(e) => setChangeReason(e.target.value)}
                        className="w-full border rounded-lg p-3 h-32"
                        placeholder="Please describe what changes you'd like to see..."
                        required
                      />
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowChangeForm(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                      >
                        Send Request
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Status Messages */}
            {isAccepted && (
              <div className="bg-green-50 rounded-lg p-6 text-center">
                <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <h3 className="font-semibold text-green-800">Quotation Accepted</h3>
                <p className="text-sm text-green-600 mt-1">
                  You have accepted this quotation. The seller will contact you soon.
                </p>
              </div>
            )}

            {isRejected && (
              <div className="bg-red-50 rounded-lg p-6 text-center">
                <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-2" />
                <h3 className="font-semibold text-red-800">Quotation Rejected</h3>
                <p className="text-sm text-red-600 mt-1">
                  You have rejected this quotation.
                </p>
              </div>
            )}

            {changesRequested && (
              <div className="bg-yellow-50 rounded-lg p-6 text-center">
                <PencilIcon className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                <h3 className="font-semibold text-yellow-800">Changes Requested</h3>
                <p className="text-sm text-yellow-600 mt-1">
                  Your change request has been sent to the seller.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationView;