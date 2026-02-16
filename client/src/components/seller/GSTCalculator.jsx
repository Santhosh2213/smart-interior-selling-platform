import React from 'react';

const GSTCalculator = ({ items, subtotal, gstTotal, laborCost, transportCost, discount, total }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Summary</h3>

      <div className="space-y-2 mb-4">
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
      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-sm font-medium mb-2">GST Breakdown</h4>
        {[5, 12, 18, 28].map(rate => {
          const itemsWithRate = items.filter(i => i.gstRate === rate);
          if (itemsWithRate.length === 0) return null;

          const taxableValue = itemsWithRate.reduce((sum, i) => {
            return sum + (i.quantity * i.pricePerUnit);
          }, 0);

          const cgst = taxableValue * (rate / 2) / 100;
          const sgst = taxableValue * (rate / 2) / 100;

          return (
            <div key={rate} className="text-xs text-gray-600 flex justify-between py-1">
              <span>GST {rate}%:</span>
              <span>
                ₹{(cgst + sgst).toFixed(2)} 
                <span className="text-gray-400 ml-1">
                  (CGST: ₹{cgst.toFixed(2)} | SGST: ₹{sgst.toFixed(2)})
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GSTCalculator;