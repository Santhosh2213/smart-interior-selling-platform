import React, { useState } from 'react';
import Modal from '../common/Modal';
import { FunnelIcon } from '@heroicons/react/24/outline';

const FilterModal = ({ isOpen, onClose, onApply, filters = {} }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleClear = () => {
    setLocalFilters({});
    onApply({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Filter" size="md">
      <div className="space-y-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <div className="space-y-2">
            {['draft', 'pending', 'quoted', 'approved', 'completed', 'rejected'].map((status) => (
              <label key={status} className="flex items-center">
                <input
                  type="checkbox"
                  checked={localFilters.status?.includes(status)}
                  onChange={(e) => {
                    const newStatus = localFilters.status || [];
                    if (e.target.checked) {
                      setLocalFilters({
                        ...localFilters,
                        status: [...newStatus, status]
                      });
                    } else {
                      setLocalFilters({
                        ...localFilters,
                        status: newStatus.filter(s => s !== status)
                      });
                    }
                  }}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 capitalize">{status}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={localFilters.startDate || ''}
              onChange={(e) => setLocalFilters({...localFilters, startDate: e.target.value})}
              className="input-field"
            />
            <input
              type="date"
              value={localFilters.endDate || ''}
              onChange={(e) => setLocalFilters({...localFilters, endDate: e.target.value})}
              className="input-field"
            />
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price Range (₹)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min"
              value={localFilters.minPrice || ''}
              onChange={(e) => setLocalFilters({...localFilters, minPrice: e.target.value})}
              className="input-field"
            />
            <input
              type="number"
              placeholder="Max"
              value={localFilters.maxPrice || ''}
              onChange={(e) => setLocalFilters({...localFilters, maxPrice: e.target.value})}
              className="input-field"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={localFilters.category || ''}
            onChange={(e) => setLocalFilters({...localFilters, category: e.target.value})}
            className="input-field"
          >
            <option value="">All Categories</option>
            <option value="tiles">Tiles</option>
            <option value="wood">Wood</option>
            <option value="glass">Glass</option>
            <option value="paints">Paints</option>
            <option value="hardware">Hardware</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <button onClick={handleClear} className="btn-secondary">
            Clear All
          </button>
          <button onClick={handleApply} className="btn-primary">
            Apply Filters
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default FilterModal;