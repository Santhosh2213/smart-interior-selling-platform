import React from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

const QuoteSummary = ({ items, subtotal, gstTotal, laborCost, transportCost, discount, total }) => {
  const calculateGST = (amount, rate) => {
    return (amount * rate) / 100;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <DocumentTextIcon className="h-5 w-5 mr-2 text-primary-600" />
        Quote Summary
      </h3>

      {/* Items List */}
      <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between text-sm">
            <div>
              <span className="font-medium">{item.materialName}</span>
              <span className="text-gray-600 ml-2">
                {item.quantity} {item.unit}
              </span>
            </div>
            <div className="text-right">
              <div>₹{item.total?.toFixed(2)}</div>
              <div className="text-xs text-gray-500">GST: {item.gstRate}%</div>
            </div>
          </div>
        ))}
      </div>

      {/* Calculations */}
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal:</span>
          <span className="font-medium">₹{subtotal?.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">GST Total:</span>
          <span className="font-medium">₹{gstTotal?.toFixed(2)}</span>
        </div>

        {laborCost > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Labor Cost:</span>
            <span className="font-medium">₹{laborCost?.toFixed(2)}</span>
          </div>
        )}

        {transportCost > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Transport:</span>
            <span className="font-medium">₹{transportCost?.toFixed(2)}</span>
          </div>
        )}

        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount:</span>
            <span>-₹{discount?.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
          <span>Total Amount:</span>
          <span className="text-primary-600">₹{total?.toFixed(2)}</span>
        </div>
      </div>

      {/* GST Breakdown */}
      <div className="mt-4 bg-gray-50 p-3 rounded-lg">
        <h4 className="text-sm font-medium mb-2">GST Breakdown</h4>
        {[5, 12, 18, 28].map(rate => {
          const itemsWithRate = items.filter(i => i.gstRate === rate);
          if (itemsWithRate.length === 0) return null;
          
          const taxableValue = itemsWithRate.reduce((sum, i) => sum + i.subtotal, 0);
          const cgst = calculateGST(taxableValue, rate / 2);
          const sgst = calculateGST(taxableValue, rate / 2);
          
          return (
            <div key={rate} className="text-xs text-gray-600 flex justify-between py-1">
              <span>GST {rate}%:</span>
              <span>₹{(cgst + sgst).toFixed(2)} (CGST: ₹{cgst.toFixed(2)} | SGST: ₹{sgst.toFixed(2)})</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuoteSummary;