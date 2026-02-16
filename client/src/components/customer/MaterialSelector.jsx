import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const MaterialSelector = ({ materials, selectedMaterials, onSelect, onQuantityChange }) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [filteredMaterials, setFilteredMaterials] = useState(materials);

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'tiles', name: 'Tiles' },
    { id: 'wood', name: 'Wood' },
    { id: 'glass', name: 'Glass' },
    { id: 'paints', name: 'Paints' },
    { id: 'hardware', name: 'Hardware' }
  ];

  useEffect(() => {
    let filtered = materials;
    
    if (search) {
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.category.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (category !== 'all') {
      filtered = filtered.filter(m => m.category === category);
    }
    
    setFilteredMaterials(filtered);
  }, [search, category, materials]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search materials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {filteredMaterials.map((material) => {
          const isSelected = selectedMaterials.some(m => m._id === material._id);
          const selectedItem = selectedMaterials.find(m => m._id === material._id);

          return (
            <div
              key={material._id}
              className={`
                border rounded-lg p-4 cursor-pointer transition-all
                ${isSelected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}
              `}
              onClick={() => onSelect(material)}
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

              {isSelected && (
                <div className="mt-3">
                  <label className="block text-sm text-gray-600 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={selectedItem?.quantity || 1}
                    onChange={(e) => {
                      e.stopPropagation();
                      onQuantityChange(material._id, e.target.value);
                    }}
                    className="w-full px-3 py-1 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MaterialSelector;