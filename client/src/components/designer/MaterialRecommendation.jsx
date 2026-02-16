import React, { useState } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

const MaterialRecommendation = ({ materials, onRecommend }) => {
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [recommendation, setRecommendation] = useState('');

  const handleSelectMaterial = (material) => {
    setSelectedMaterials(prev => {
      const exists = prev.find(m => m._id === material._id);
      if (exists) {
        return prev.filter(m => m._id !== material._id);
      } else {
        return [...prev, material];
      }
    });
  };

  const handleSubmit = () => {
    onRecommend({
      materials: selectedMaterials,
      recommendation
    });
  };

  return (
    <div className="space-y-6">
      {/* Recommendation Text */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Your Recommendation</h3>
        <textarea
          value={recommendation}
          onChange={(e) => setRecommendation(e.target.value)}
          rows="4"
          className="input-field"
          placeholder="Explain why you're recommending these materials..."
        />
      </div>

      {/* Materials Grid */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Select Materials</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {materials.map((material) => {
            const isSelected = selectedMaterials.some(m => m._id === material._id);
            
            return (
              <div
                key={material._id}
                className={`
                  border rounded-lg p-4 cursor-pointer transition-all
                  ${isSelected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}
                `}
                onClick={() => handleSelectMaterial(material)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{material.name}</h4>
                    <p className="text-sm text-gray-600 capitalize">{material.category}</p>
                  </div>
                  {isSelected && <CheckCircleIcon className="h-5 w-5 text-primary-600" />}
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Unit: {material.unit}</span>
                  <span className="font-bold text-primary-600">₹{material.pricePerUnit}</span>
                </div>

                <div className="mt-2 text-xs text-gray-500">
                  GST: {material.gstRate}% | HSN: {material.hsnCode || 'N/A'}
                </div>
              </div>
            );
          })}
        </div>

        {selectedMaterials.length > 0 && (
          <div className="mt-6 flex justify-end">
            <button onClick={handleSubmit} className="btn-primary">
              Send Recommendations
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialRecommendation;