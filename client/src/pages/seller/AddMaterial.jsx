import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { materialService } from '../../services/materialService';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AddMaterial = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'tiles',
    subcategory: '',
    unit: 'sqft',
    pricePerUnit: '',
    gstRate: 18,
    hsnCode: '',
    stock: '',
    supplier: '',
    description: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await materialService.createMaterial(formData);
      toast.success('Material added successfully');
      navigate('/seller/materials');
    } catch (error) {
      toast.error('Failed to add material');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <button
        onClick={() => navigate('/seller/materials')}
        className="flex items-center text-gray-600 hover:text-primary-600 mb-6"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        Back to Materials
      </button>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Material</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Material Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="e.g., Premium Ceramic Tiles"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="input-field"
              >
                <option value="tiles">Tiles</option>
                <option value="wood">Wood</option>
                <option value="glass">Glass</option>
                <option value="paints">Paints</option>
                <option value="hardware">Hardware</option>
                <option value="others">Others</option>
              </select>
            </div>

            {/* Subcategory */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subcategory
              </label>
              <input
                type="text"
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., Ceramic, Vitrified"
              />
            </div>

            {/* Unit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit *
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
                className="input-field"
              >
                <option value="sqft">Square Feet (sq ft)</option>
                <option value="sqm">Square Meters (sq m)</option>
                <option value="piece">Piece</option>
                <option value="box">Box</option>
                <option value="liter">Liter</option>
                <option value="kg">Kilogram (kg)</option>
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price per Unit (₹) *
              </label>
              <input
                type="number"
                name="pricePerUnit"
                value={formData.pricePerUnit}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="input-field"
                placeholder="0.00"
              />
            </div>

            {/* GST Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GST Rate (%) *
              </label>
              <select
                name="gstRate"
                value={formData.gstRate}
                onChange={handleChange}
                required
                className="input-field"
              >
                <option value="0">0%</option>
                <option value="5">5%</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
                <option value="28">28%</option>
              </select>
            </div>

            {/* HSN Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HSN Code
              </label>
              <input
                type="text"
                name="hsnCode"
                value={formData.hsnCode}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., 6907"
              />
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                className="input-field"
                placeholder="0"
              />
            </div>

            {/* Supplier */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier
              </label>
              <input
                type="text"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                className="input-field"
                placeholder="Supplier name"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="input-field"
                placeholder="Material description, specifications, etc."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/seller/materials')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Adding...' : 'Add Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMaterial;