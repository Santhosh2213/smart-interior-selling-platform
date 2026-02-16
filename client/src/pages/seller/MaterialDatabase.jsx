import React, { useState, useEffect } from 'react';
import { materialService } from '../../services/materialService';
import MaterialDatabase from '../../components/seller/MaterialDatabase';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const MaterialDatabasePage = () => {
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
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

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await materialService.getAllMaterials();
      setMaterials(response.data);
    } catch (error) {
      toast.error('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMaterial = () => {
    setEditingMaterial(null);
    setFormData({
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
    setShowModal(true);
  };

  const handleEditMaterial = (material) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      category: material.category,
      subcategory: material.subcategory || '',
      unit: material.unit,
      pricePerUnit: material.pricePerUnit,
      gstRate: material.gstRate,
      hsnCode: material.hsnCode || '',
      stock: material.stock,
      supplier: material.supplier || '',
      description: material.description || ''
    });
    setShowModal(true);
  };

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm('Are you sure you want to delete this material?')) {
      return;
    }

    try {
      await materialService.deleteMaterial(id);
      toast.success('Material deleted successfully');
      fetchMaterials();
    } catch (error) {
      toast.error('Failed to delete material');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingMaterial) {
        await materialService.updateMaterial(editingMaterial._id, formData);
        toast.success('Material updated successfully');
      } else {
        await materialService.createMaterial(formData);
        toast.success('Material added successfully');
      }
      setShowModal(false);
      fetchMaterials();
    } catch (error) {
      toast.error(editingMaterial ? 'Failed to update material' : 'Failed to add material');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
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
    <div className="container mx-auto px-4 py-8">
      <MaterialDatabase
        materials={materials}
        onAdd={handleAddMaterial}
        onEdit={handleEditMaterial}
        onDelete={handleDeleteMaterial}
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingMaterial ? 'Edit Material' : 'Add New Material'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>

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
              />
            </div>

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
              />
            </div>

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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier
              </label>
              <input
                type="text"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="input-field"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {editingMaterial ? 'Update' : 'Add'} Material
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MaterialDatabasePage;