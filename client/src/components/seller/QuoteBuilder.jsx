import React, { useState } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import GSTCalculator from './GSTCalculator';

const QuoteBuilder = ({ project, materials, onSave }) => {
  const [items, setItems] = useState([]);
  const [laborCost, setLaborCost] = useState(0);
  const [transportCost, setTransportCost] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('percentage');
  const [notes, setNotes] = useState('');

  const addItem = () => {
    setItems([...items, { 
      materialId: '', 
      quantity: 1,
      pricePerUnit: 0,
      gstRate: 18
    }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    // If material is selected, update price and GST
    if (field === 'materialId') {
      const material = materials.find(m => m._id === value);
      if (material) {
        newItems[index].pricePerUnit = material.pricePerUnit;
        newItems[index].gstRate = material.gstRate;
        newItems[index].materialName = material.name;
        newItems[index].unit = material.unit;
      }
    }
    
    setItems(newItems);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.pricePerUnit), 0);
  };

  const calculateGST = () => {
    return items.reduce((sum, item) => {
      const subtotal = item.quantity * item.pricePerUnit;
      return sum + (subtotal * item.gstRate / 100);
    }, 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    const gstTotal = calculateGST();
    const totalBeforeDiscount = subtotal + gstTotal + laborCost + transportCost;
    
    if (discountType === 'percentage') {
      return totalBeforeDiscount * (discount / 100);
    } else {
      return discount;
    }
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const gstTotal = calculateGST();
    const discountAmount = calculateDiscount();
    
    return subtotal + gstTotal + laborCost + transportCost - discountAmount;
  };

  const handleSave = () => {
    const quotationData = {
      projectId: project._id,
      items: items.map(item => ({
        materialId: item.materialId,
        materialName: item.materialName,
        quantity: item.quantity,
        unit: item.unit,
        pricePerUnit: item.pricePerUnit,
        subtotal: item.quantity * item.pricePerUnit,
        gstRate: item.gstRate,
        gstAmount: (item.quantity * item.pricePerUnit) * (item.gstRate / 100),
        total: (item.quantity * item.pricePerUnit) * (1 + item.gstRate / 100)
      })),
      subtotal: calculateSubtotal(),
      gstTotal: calculateGST(),
      laborCost,
      transportCost,
      discount: calculateDiscount(),
      discountType,
      total: calculateTotal(),
      notes
    };

    onSave(quotationData);
  };

  return (
    <div className="space-y-6">
      {/* Items */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Items</h3>
          <button onClick={addItem} className="btn-primary text-sm py-2">
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Item
          </button>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="flex gap-4 items-start bg-gray-50 p-4 rounded-lg">
              <div className="flex-1">
                <select
                  value={item.materialId}
                  onChange={(e) => updateItem(index, 'materialId', e.target.value)}
                  className="input-field"
                >
                  <option value="">Select Material</option>
                  {materials.map(m => (
                    <option key={m._id} value={m._id}>
                      {m.name} - ₹{m.pricePerUnit}/{m.unit}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="w-32">
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                  className="input-field"
                  placeholder="Qty"
                  min="0.01"
                  step="0.01"
                />
              </div>
              
              <div className="w-32">
                <input
                  type="number"
                  value={item.pricePerUnit}
                  onChange={(e) => updateItem(index, 'pricePerUnit', parseFloat(e.target.value))}
                  className="input-field"
                  placeholder="Price"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="w-24">
                <select
                  value={item.gstRate}
                  onChange={(e) => updateItem(index, 'gstRate', parseInt(e.target.value))}
                  className="input-field"
                >
                  <option value={0}>0%</option>
                  <option value={5}>5%</option>
                  <option value={12}>12%</option>
                  <option value={18}>18%</option>
                  <option value={28}>28%</option>
                </select>
              </div>
              
              <button
                onClick={() => removeItem(index)}
                className="text-red-600 hover:text-red-700 p-2"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          ))}

          {items.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              No items added. Click "Add Item" to start building the quotation.
            </p>
          )}
        </div>
      </div>

      {/* Additional Costs */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Additional Costs</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Labor Cost (₹)
            </label>
            <input
              type="number"
              value={laborCost}
              onChange={(e) => setLaborCost(parseFloat(e.target.value) || 0)}
              className="input-field"
              min="0"
              step="100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transport Cost (₹)
            </label>
            <input
              type="number"
              value={transportCost}
              onChange={(e) => setTransportCost(parseFloat(e.target.value) || 0)}
              className="input-field"
              min="0"
              step="100"
            />
          </div>
        </div>
      </div>

      {/* Discount */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Discount</h3>
        
        <div className="flex gap-4">
          <div className="w-32">
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              className="input-field"
              min="0"
              step={discountType === 'percentage' ? '1' : '100'}
            />
          </div>
          
          <select
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value)}
            className="input-field w-40"
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount (₹)</option>
          </select>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Notes</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows="4"
          className="input-field"
          placeholder="Add any terms, conditions, or notes for the customer..."
        />
      </div>

      {/* Summary */}
      <GSTCalculator
        items={items}
        subtotal={calculateSubtotal()}
        gstTotal={calculateGST()}
        laborCost={laborCost}
        transportCost={transportCost}
        discount={calculateDiscount()}
        total={calculateTotal()}
      />

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <button className="btn-secondary">Save as Draft</button>
        <button onClick={handleSave} className="btn-primary">
          Generate Quotation
        </button>
      </div>
    </div>
  );
};

export default QuoteBuilder;