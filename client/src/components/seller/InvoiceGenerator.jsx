import React from 'react';
import { DocumentArrowDownIcon, PrinterIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

const InvoiceGenerator = ({ order, onDownload, onEmail, onPrint }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Invoice #{order?.invoiceNumber}</h3>
        <div className="flex space-x-2">
          <button
            onClick={onDownload}
            className="btn-secondary flex items-center text-sm"
          >
            <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
            Download
          </button>
          <button
            onClick={onPrint}
            className="btn-secondary flex items-center text-sm"
          >
            <PrinterIcon className="h-4 w-4 mr-1" />
            Print
          </button>
          <button
            onClick={onEmail}
            className="btn-secondary flex items-center text-sm"
          >
            <EnvelopeIcon className="h-4 w-4 mr-1" />
            Email
          </button>
        </div>
      </div>

      {/* Invoice Preview */}
      <div className="border rounded-lg p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
            <p className="text-sm text-gray-600 mt-1">#{order?.invoiceNumber}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold">{order?.seller?.businessName}</p>
            <p className="text-sm text-gray-600">GST: {order?.seller?.gstin}</p>
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Bill To:</h3>
          <p className="font-medium">{order?.customer?.userId?.name}</p>
          <p className="text-sm text-gray-600">{order?.customer?.addresses?.[0]?.addressLine1}</p>
          <p className="text-sm text-gray-600">
            {order?.customer?.addresses?.[0]?.city}, {order?.customer?.addresses?.[0]?.state} - {order?.customer?.addresses?.[0]?.pincode}
          </p>
          <p className="text-sm text-gray-600 mt-1">GST: {order?.customer?.gstin || 'N/A'}</p>
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
            {order?.items?.map((item, index) => (
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
        <div className="flex justify-end">
          <div className="w-64">
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-600">Subtotal:</span>
              <span className="text-sm font-medium">₹{order?.subtotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-600">GST Total:</span>
              <span className="text-sm font-medium">₹{order?.gstTotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-t">
              <span className="font-medium">Total:</span>
              <span className="font-bold text-primary-600">₹{order?.total?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;