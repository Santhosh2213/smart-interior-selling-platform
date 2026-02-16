import React, { useState } from 'react';
import { MagnifyingGlassIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const MaterialDatabase = ({ materials, onAdd, onEdit, onDelete }) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
                         m.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || m.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Material Database</h2>
        <button onClick={onAdd} className="btn-primary flex items-center">
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Material
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search materials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All Categories</option>
          <option value="tiles">Tiles</option>
          <option value="wood">Wood</option>
          <option value="glass">Glass</option>
          <option value="paints">Paints</option>
          <option value="hardware">Hardware</option>
        </select>
      </div>

      {/* Materials Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">GST</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMaterials.map((material) => (
              <tr key={material._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{material.name}</div>
                  <div className="text-xs text-gray-500">{material.hsnCode}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap capitalize">
                  <span className="text-sm text-gray-900">{material.category}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {material.unit}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₹{material.pricePerUnit}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {material.gstRate}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {material.stock}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onEdit(material)}
                    className="text-primary-600 hover:text-primary-900 mr-3"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(material._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredMaterials.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No materials found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialDatabase;