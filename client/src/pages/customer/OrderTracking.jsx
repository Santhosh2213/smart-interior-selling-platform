import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { 
  ArrowLeftIcon, 
  CheckCircleIcon, 
  ClockIcon,
  TruckIcon,
  HomeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await orderService.getOrderById(id);
      setOrder(response.data);
    } catch (error) {
      toast.error('Failed to fetch order');
      navigate('/customer/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <ClockIcon className="h-6 w-6 text-yellow-500" />;
      case 'confirmed': return <CheckCircleIcon className="h-6 w-6 text-blue-500" />;
      case 'processing': return <DocumentTextIcon className="h-6 w-6 text-purple-500" />;
      case 'shipped': return <TruckIcon className="h-6 w-6 text-indigo-500" />;
      case 'delivered': return <HomeIcon className="h-6 w-6 text-green-500" />;
      default: return <ClockIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const timeline = [
    { status: 'pending', label: 'Order Placed', date: order?.createdAt },
    { status: 'confirmed', label: 'Order Confirmed', date: order?.confirmedAt },
    { status: 'processing', label: 'Processing', date: order?.processingAt },
    { status: 'shipped', label: 'Shipped', date: order?.shippedAt },
    { status: 'delivered', label: 'Delivered', date: order?.deliveredAt }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/customer/dashboard')}
          className="mr-4 text-gray-600 hover:text-primary-600"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Track Order</h1>
          <p className="text-gray-600">Order #{order?.orderNumber}</p>
        </div>
      </div>

      {/* Order Status */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Current Status</h2>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order?.status)}`}>
            {order?.status}
          </span>
        </div>

        {/* Timeline */}
        <div className="relative">
          {timeline.map((step, index) => {
            const isCompleted = step.date || 
              (order?.status === step.status) ||
              (timeline.findIndex(t => t.status === order?.status) > index);
            
            return (
              <div key={step.status} className="flex items-start mb-6 last:mb-0">
                <div className="relative">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${isCompleted ? 'bg-primary-100' : 'bg-gray-100'}
                  `}>
                    {getStatusIcon(step.status)}
                  </div>
                  {index < timeline.length - 1 && (
                    <div className={`
                      absolute top-10 left-4 w-0.5 h-12
                      ${isCompleted ? 'bg-primary-200' : 'bg-gray-200'}
                    `} />
                  )}
                </div>
                
                <div className="ml-4 flex-1">
                  <h3 className={`font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                    {step.label}
                  </h3>
                  {step.date && (
                    <p className="text-sm text-gray-600">
                      {new Date(step.date).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Details */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Order Details</h2>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Order Date:</span>
            <span className="font-medium">{new Date(order?.createdAt).toLocaleDateString()}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Total Amount:</span>
            <span className="font-bold text-primary-600">₹{order?.total?.toFixed(2)}</span>
          </div>
          
          {order?.trackingId && (
            <div className="flex justify-between">
              <span className="text-gray-600">Tracking ID:</span>
              <span className="font-medium">{order.trackingId}</span>
            </div>
          )}
          
          {order?.deliveryDate && (
            <div className="flex justify-between">
              <span className="text-gray-600">Expected Delivery:</span>
              <span className="font-medium">{new Date(order.deliveryDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Items</h2>
        
        <div className="space-y-4">
          {order?.items?.map((item, index) => (
            <div key={index} className="flex justify-between items-center border-b pb-3 last:border-0">
              <div>
                <p className="font-medium">{item.materialName}</p>
                <p className="text-sm text-gray-600">
                  Quantity: {item.quantity} {item.unit}
                </p>
              </div>
              <span className="font-medium">₹{item.total?.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex justify-end space-x-4">
        <button
          onClick={() => navigate(`/customer/invoice/${order?.invoice?._id}`)}
          className="btn-secondary"
        >
          View Invoice
        </button>
        <button
          onClick={() => navigate(`/chat?order=${order?._id}`)}
          className="btn-primary"
        >
          Contact Support
        </button>
      </div>
    </div>
  );
};

export default OrderTracking;