import React, { useState, useEffect } from 'react';
import { 
  getAllMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  searchMaterials,
  getMaterialsByCategory
} from '../../services/materialService';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const MaterialDatabase = () => {
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'tiles',
    description: '',
    unit: 'sqft',
    pricePerUnit: '',
    gstRate: '18',
    stockQuantity: '0',
    minimumStock: '0',
    isActive: true
  });

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'tiles', name: 'Tiles' },
    { id: 'wood', name: 'Wood' },
    { id: 'glass', name: 'Glass' },
    { id: 'paints', name: 'Paints' },
    { id: 'hardware', name: 'Hardware' },
    { id: 'electrical', name: 'Electrical' },
    { id: 'plumbing', name: 'Plumbing' },
    { id: 'other', name: 'Other' }
  ];

  const units = [
    { id: 'sqft', name: 'Square Feet' },
    { id: 'sqm', name: 'Square Meters' },
    { id: 'pieces', name: 'Pieces' },
    { id: 'boxes', name: 'Boxes' },
    { id: 'liters', name: 'Liters' },
    { id: 'kg', name: 'Kilograms' },
    { id: 'meters', name: 'Meters' },
    { id: 'feet', name: 'Feet' }
  ];

  useEffect(() => {
    loadMaterials();
  }, []);

  useEffect(() => {
    filterMaterials();
  }, [searchQuery, selectedCategory, materials]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const response = await getAllMaterials();
      setMaterials(response.data || []);
      setFilteredMaterials(response.data || []);
    } catch (error) {
      console.error('Error loading materials:', error);
      toast.error('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const filterMaterials = () => {
    let filtered = [...materials];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(m => m.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m => 
        m.name?.toLowerCase().includes(query) ||
        m.description?.toLowerCase().includes(query) ||
        m.category?.toLowerCase().includes(query)
      );
    }

    setFilteredMaterials(filtered);
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 2) {
      try {
        const response = await searchMaterials(query);
        setFilteredMaterials(response.data || []);
      } catch (error) {
        console.error('Error searching materials:', error);
      }
    } else {
      filterMaterials();
    }
  };

  const handleCategoryChange = async (e) => {
    const category = e.target.value;
    setSelectedCategory(category);

    if (category !== 'all') {
      try {
        const response = await getMaterialsByCategory(category);
        setFilteredMaterials(response.data || []);
      } catch (error) {
        console.error('Error fetching materials by category:', error);
      }
    } else {
      filterMaterials();
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name || '',
      category: material.category || 'tiles',
      description: material.description || '',
      unit: material.unit || 'sqft',
      pricePerUnit: material.pricePerUnit || material.price || '',
      gstRate: material.gstRate || '18',
      stockQuantity: material.stockQuantity || '0',
      minimumStock: material.minimumStock || '0',
      isActive: material.isActive !== false
    });
    setShowForm(true);
  };

  const handleDelete = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;

    try {
      await deleteMaterial(materialId);
      toast.success('Material deleted successfully');
      loadMaterials();
    } catch (error) {
      console.error('Error deleting material:', error);
      toast.error('Failed to delete material');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please enter material name');
      return;
    }

    if (!formData.pricePerUnit || formData.pricePerUnit <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setSubmitting(true);
    try {
      const materialData = {
        ...formData,
        pricePerUnit: parseFloat(formData.pricePerUnit),
        gstRate: parseFloat(formData.gstRate),
        stockQuantity: parseInt(formData.stockQuantity),
        minimumStock: parseInt(formData.minimumStock)
      };

      if (editingMaterial) {
        await updateMaterial(editingMaterial._id, materialData);
        toast.success('Material updated successfully');
      } else {
        await createMaterial(materialData);
        toast.success('Material created successfully');
      }

      setShowForm(false);
      setEditingMaterial(null);
      setFormData({
        name: '',
        category: 'tiles',
        description: '',
        unit: 'sqft',
        pricePerUnit: '',
        gstRate: '18',
        stockQuantity: '0',
        minimumStock: '0',
        isActive: true
      });
      loadMaterials();
    } catch (error) {
      console.error('Error saving material:', error);
      toast.error(error.response?.data?.error || 'Failed to save material');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Material Database</h1>
            <p className="text-gray-600">Manage your material inventory and pricing</p>
          </div>
          <button
            onClick={() => {
              setEditingMaterial(null);
              setFormData({
                name: '',
                category: 'tiles',
                description: '',
                unit: 'sqft',
                pricePerUnit: '',
                gstRate: '18',
                stockQuantity: '0',
                minimumStock: '0',
                isActive: true
              });
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Material
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search materials..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:w-48">
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">
                    {editingMaterial ? 'Edit Material' : 'Add New Material'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingMaterial(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Material Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {categories.filter(c => c.id !== 'all').map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unit
                      </label>
                      <select
                        name="unit"
                        value={formData.unit}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {units.map(unit => (
                          <option key={unit.id} value={unit.id}>
                            {unit.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price Per Unit (₹) *
                      </label>
                      <input
                        type="number"
                        name="pricePerUnit"
                        value={formData.pricePerUnit}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        GST Rate (%)
                      </label>
                      <input
                        type="number"
                        name="gstRate"
                        value={formData.gstRate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stock Quantity
                      </label>
                      <input
                        type="number"
                        name="stockQuantity"
                        value={formData.stockQuantity}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum Stock
                      </label>
                      <input
                        type="number"
                        name="minimumStock"
                        value={formData.minimumStock}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Active (available for quotations)</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingMaterial(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                    >
                      {submitting ? 'Saving...' : (
                        <>
                          <CheckIcon className="h-5 w-5 mr-2" />
                          {editingMaterial ? 'Update' : 'Create'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Materials Grid */}
        {filteredMaterials.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 mb-2">No materials found</p>
            <p className="text-sm text-gray-500">
              {searchQuery || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Click "Add Material" to create your first material'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((material) => (
              <div key={material._id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{material.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      material.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {material.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-2 capitalize">Category: {material.category}</p>
                  {material.description && (
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{material.description}</p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium">{formatCurrency(material.pricePerUnit || material.price)}/{material.unit}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">GST:</span>
                      <span className="font-medium">{material.gstRate || 18}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Stock:</span>
                      <span className={`font-medium ${material.stockQuantity <= material.minimumStock ? 'text-red-600' : ''}`}>
                        {material.stockQuantity || 0} {material.unit}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <button
                      onClick={() => handleEdit(material)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(material._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialDatabase;