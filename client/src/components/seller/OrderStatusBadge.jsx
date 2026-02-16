import React from 'react';

const OrderStatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
    confirmed: { color: 'bg-blue-100 text-blue-800', label: 'Confirmed' },
    processing: { color: 'bg-purple-100 text-purple-800', label: 'Processing' },
    shipped: { color: 'bg-indigo-100 text-indigo-800', label: 'Shipped' },
    delivered: { color: 'bg-green-100 text-green-800', label: 'Delivered' },
    cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
    returned: { color: 'bg-gray-100 text-gray-800', label: 'Returned' }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

export default OrderStatusBadge;