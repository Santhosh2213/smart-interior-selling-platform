import React, { useState, useEffect } from 'react';
import { gstService } from '../../services/gstService';
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
// ... rest of the code remains the same

const GSTSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gstCategories, setGstCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchGSTCategories();
  }, []);

  const fetchGSTCategories = async () => {
    try {
      const response = await gstService.getGSTCategories();
      setGstCategories(response.data);
    } catch (error) {
      toast.error('Failed to load GST settings');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category._id);
    setEditForm({
      cgst: category.cgst,
      sgst: category.sgst,
      igst: category.igst,
      hsnCode: category.hsnCode
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = async (id) => {
    setSaving(true);
    try {
      await gstService.updateGSTCategory(id, editForm);
      toast.success('GST rate updated successfully');
      fetchGSTCategories();
      setEditingId(null);
    } catch (error) {
      toast.error('Failed to update GST rate');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setEditForm({
      ...editForm,
      [field]: parseFloat(value) || 0
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">GST Settings</h1>
        <p className="text-gray-600">Manage GST rates for different material categories</p>
      </div>

      {/* GST Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">HSN Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CGST (%)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SGST (%)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IGST (%)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {gstCategories.map((category) => (
              <tr key={category._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-medium capitalize">{category.materialCategory}</span>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === category._id ? (
                    <input
                      type="text"
                      value={editForm.hsnCode || ''}
                      onChange={(e) => handleChange('hsnCode', e.target.value)}
                      className="w-24 px-2 py-1 border rounded text-sm"
                    />
                  ) : (
                    <span className="text-sm">{category.hsnCode}</span>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === category._id ? (
                    <input
                      type="number"
                      value={editForm.cgst}
                      onChange={(e) => handleChange('cgst', e.target.value)}
                      className="w-16 px-2 py-1 border rounded text-sm"
                      min="0"
                      max="50"
                      step="0.1"
                    />
                  ) : (
                    <span className="text-sm">{category.cgst}%</span>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === category._id ? (
                    <input
                      type="number"
                      value={editForm.sgst}
                      onChange={(e) => handleChange('sgst', e.target.value)}
                      className="w-16 px-2 py-1 border rounded text-sm"
                      min="0"
                      max="50"
                      step="0.1"
                    />
                  ) : (
                    <span className="text-sm">{category.sgst}%</span>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === category._id ? (
                    <input
                      type="number"
                      value={editForm.igst}
                      onChange={(e) => handleChange('igst', e.target.value)}
                      className="w-16 px-2 py-1 border rounded text-sm"
                      min="0"
                      max="50"
                      step="0.1"
                    />
                  ) : (
                    <span className="text-sm">{category.igst}%</span>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-medium">{category.cgst + category.sgst}%</span>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === category._id ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSave(category._id)}
                        disabled={saving}
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">About GST Settings</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• GST rates are applied based on material category</li>
          <li>• CGST and SGST are half of the total GST rate (for intra-state sales)</li>
          <li>• IGST is the total GST rate (for inter-state sales)</li>
          <li>• Changes will affect all future quotations</li>
        </ul>
      </div>
    </div>
  );
};

export default GSTSettings;