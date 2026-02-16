import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { paymentService } from '../../services/paymentService';
import { quotationService } from '../../services/quotationService';
import { 
  ArrowLeftIcon, 
  CreditCardIcon, 
  BanknotesIcon,
  QrCodeIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const PaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [quotation, setQuotation] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');

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

  const handlePayment = async () => {
    setProcessing(true);
    
    try {
      const response = await paymentService.processPayment({
        quotationId: id,
        amount: quotation.total,
        method: paymentMethod
      });
      
      if (response.success) {
        toast.success('Payment successful!');
        navigate(`/customer/order/${response.data.orderId}`);
      }
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCardIcon,
      description: 'Pay securely with your card'
    },
    {
      id: 'upi',
      name: 'UPI',
      icon: QrCodeIcon,
      description: 'Google Pay, PhonePe, Paytm'
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      icon: BanknotesIcon,
      description: 'All major banks supported'
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(`/customer/quotation/${id}`)}
          className="mr-4 text-gray-600 hover:text-primary-600"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Make Payment</h1>
          <p className="text-gray-600">Quotation #{quotation?.quotationNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment Methods */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Select Payment Method</h2>
            
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <label
                  key={method.id}
                  className={`
                    flex items-center p-4 border rounded-lg cursor-pointer transition-all
                    ${paymentMethod === method.id 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-primary-300'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <method.icon className={`h-6 w-6 ml-3 ${
                    paymentMethod === method.id ? 'text-primary-600' : 'text-gray-400'
                  }`} />
                  <div className="ml-3">
                    <p className={`font-medium ${
                      paymentMethod === method.id ? 'text-primary-600' : 'text-gray-900'
                    }`}>
                      {method.name}
                    </p>
                    <p className="text-sm text-gray-500">{method.description}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Payment Form */}
            {paymentMethod === 'card' && (
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="input-field"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVV
                    </label>
                    <input
                      type="password"
                      placeholder="123"
                      maxLength="3"
                      className="input-field"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name on Card
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="input-field"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'upi' && (
              <div className="mt-6">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <QrCodeIcon className="h-32 w-32 mx-auto mb-4 text-gray-600" />
                  <p className="text-sm text-gray-600 mb-2">
                    Scan this QR code with any UPI app
                  </p>
                  <p className="text-xs text-gray-500">
                    Or enter UPI ID: payments@smartseller
                  </p>
                </div>
              </div>
            )}

            {paymentMethod === 'netbanking' && (
              <div className="mt-6">
                <select className="input-field">
                  <option value="">Select your bank</option>
                  <option value="sbi">State Bank of India</option>
                  <option value="hdfc">HDFC Bank</option>
                  <option value="icici">ICICI Bank</option>
                  <option value="axis">Axis Bank</option>
                  <option value="kotak">Kotak Mahindra Bank</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 className="text-lg font-semibold mb-4">Payment Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span>₹{quotation?.subtotal?.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">GST:</span>
                <span>₹{quotation?.gstTotal?.toFixed(2)}</span>
              </div>
              
              {quotation?.laborCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Labor:</span>
                  <span>₹{quotation?.laborCost?.toFixed(2)}</span>
                </div>
              )}
              
              {quotation?.transportCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Transport:</span>
                  <span>₹{quotation?.transportCost?.toFixed(2)}</span>
                </div>
              )}
              
              {quotation?.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-₹{quotation?.discount?.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-lg font-bold border-t pt-3">
                <span>Total:</span>
                <span className="text-primary-600">₹{quotation?.total?.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={processing}
              className="w-full btn-primary py-3 text-lg disabled:opacity-50"
            >
              {processing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                'Pay Now'
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Your payment is secure and encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;