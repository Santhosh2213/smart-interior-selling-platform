import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { materialService } from '../../services/materialService';
import { quotationService } from '../../services/quotationService';
import { 
  ArrowLeftIcon, 
  PlusIcon, 
  TrashIcon,
  CalculatorIcon,
  MagnifyingGlassIcon 
} from '@heroicons/react/24/outline';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const CreateQuotation = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [formData, setFormData] = useState({
    laborCost: 0,
    transportCost: 0,
    discount: 0,
    discountType: 'percentage',
    terms: '1. All prices are subject to GST\n2. Delivery charges extra\n3. Payment terms: 50% advance, 50% before delivery',
    notes: ''
  });

  const categories = [
    { id: 'all', name: 'All Materials' },
    { id: 'tiles', name: 'Tiles' },
    { id: 'wood', name: 'Wood' },
    { id: 'glass', name: 'Glass' },
    { id: 'paints', name: 'Paints' },
    { id: 'hardware', name: 'Hardware' },
    { id: 'others', name: 'Others' }
  ];

  useEffect(() => {
    fetchData();
  }, [projectId]);

  useEffect(() => {
    // Filter materials when search query or category changes
    if (materials && materials.length > 0) {
      let filtered = [...materials];
      
      // Filter by category
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(m => m.category === selectedCategory);
      }
      
      // Filter by search
      if (searchQuery) {
        filtered = filtered.filter(m => 
          m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.category?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      setFilteredMaterials(filtered);
    }
  }, [searchQuery, selectedCategory, materials]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching project data for ID:', projectId);
      
      const [projectRes, materialsRes] = await Promise.all([
        projectService.getProjectById(projectId),
        materialService.getAllMaterials()
      ]);
      
      console.log('Project response:', projectRes);
      console.log('Materials response:', materialsRes);
      
      // Check the structure of materials response
      // The API returns { success: true, message: "...", data: [...] }
      let materialsData = [];
      if (materialsRes && materialsRes.data) {
        materialsData = materialsRes.data;
        console.log('Materials array:', materialsData);
        console.log('Number of materials:', materialsData.length);
      } else if (Array.isArray(materialsRes)) {
        materialsData = materialsRes;
      }
      
      setProject(projectRes.data || null);
      setMaterials(materialsData);
      setFilteredMaterials(materialsData);
      
      if (materialsData.length === 0) {
        console.warn('No materials found in response');
      } else {
        console.log('First material:', materialsData[0]);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error(error.response?.data?.error || 'Failed to load data');
      navigate('/seller/project-queue');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = (material) => {
    if (!material) return;
    
    setSelectedItems(prev => {
      const exists = prev.find(item => item.materialId === material._id);
      if (exists) {
        return prev.map(item =>
          item.materialId === material._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          materialId: material._id,
          materialName: material.name || 'Unknown',
          quantity: 1,
          pricePerUnit: material.pricePerUnit || 0,
          unit: material.unit || 'sqft',
          gstRate: material.gstRate || 18
        }
      ];
    });
    
    toast.success(`${material.name} added to quotation`);
  };

  const handleRemoveItem = (materialId) => {
    setSelectedItems(prev => prev.filter(item => item.materialId !== materialId));
    toast.success('Item removed');
  };

  const handleQuantityChange = (materialId, quantity) => {
    if (quantity < 0.01) return;
    setSelectedItems(prev =>
      prev.map(item =>
        item.materialId === materialId
          ? { ...item, quantity: parseFloat(quantity) || 0 }
          : item
      )
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Cost') ? parseFloat(value) || 0 : value
    }));
  };

  const calculateItemTotals = (item) => {
    const subtotal = (item.pricePerUnit || 0) * (item.quantity || 0);
    const gst = subtotal * ((item.gstRate || 0) / 100);
    const total = subtotal + gst;
    return { subtotal, gst, total };
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let gstTotal = 0;

    selectedItems.forEach(item => {
      const { subtotal: itemSubtotal, gst: itemGst } = calculateItemTotals(item);
      subtotal += itemSubtotal;
      gstTotal += itemGst;
    });

    let discountAmount = 0;
    if (formData.discount > 0) {
      if (formData.discountType === 'percentage') {
        discountAmount = (subtotal + gstTotal) * (formData.discount / 100);
      } else {
        discountAmount = formData.discount;
      }
    }

    const total = subtotal + gstTotal + 
                  parseFloat(formData.laborCost || 0) + 
                  parseFloat(formData.transportCost || 0) - 
                  discountAmount;

    return {
      subtotal: subtotal || 0,
      gstTotal: gstTotal || 0,
      discountAmount: discountAmount || 0,
      total: total || 0
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedItems || selectedItems.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    setSubmitting(true);

    try {
      const quotationData = {
        projectId,
        items: selectedItems.map(item => ({
          materialId: item.materialId,
          quantity: item.quantity
        })),
        laborCost: parseFloat(formData.laborCost) || 0,
        transportCost: parseFloat(formData.transportCost) || 0,
        discount: parseFloat(formData.discount) || 0,
        discountType: formData.discountType,
        terms: formData.terms,
        notes: formData.notes
      };

      const response = await quotationService.createQuotation(quotationData);
      
      if (response && response.data) {
        // Send the quotation
        await quotationService.sendQuotation(response.data._id);
        toast.success('Quotation created and sent successfully!');
        navigate('/seller/quotations');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.error || 'Failed to create quotation');
    } finally {
      setSubmitting(false);
    }
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Project not found</p>
        <button
          onClick={() => navigate('/seller/project-queue')}
          className="btn-primary mt-4"
        >
          Back to Queue
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/seller/project-queue')}
          className="mr-4 text-gray-600 hover:text-primary-600"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Quotation</h1>
          <p className="text-gray-600">Project: {project?.title || 'Unknown'}</p>
          <p className="text-sm text-gray-500">
            Customer: {project?.customerId?.userId?.name || 'Unknown'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Materials Selection */}
        <div className="lg:col-span-2">
          {/* Search and Filter */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search materials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
              <div className="sm:w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input-field"
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

          {/* Materials Grid */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Available Materials</h2>
            {filteredMaterials && filteredMaterials.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMaterials.map((material) => (
                  <div
                    key={material._id}
                    className="border rounded-lg p-4 hover:shadow-md cursor-pointer transition-all hover:border-primary-300"
                    onClick={() => handleAddItem(material)}
                  >
                    <h3 className="font-medium text-gray-900">{material.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{material.category}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-500">Unit: {material.unit}</span>
                      <span className="font-semibold text-primary-600">
                        ₹{material.pricePerUnit}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">GST: {material.gstRate}%</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                {searchQuery || selectedCategory !== 'all' 
                  ? 'No materials match your filters' 
                  : 'No materials available'}
              </p>
            )}
          </div>

          {/* Selected Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Selected Items</h2>
            {!selectedItems || selectedItems.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Click on materials to add them to quotation
              </p>
            ) : (
              <div className="space-y-4">
                {selectedItems.map((item) => {
                  const { subtotal, gst, total } = calculateItemTotals(item);
                  return (
                    <div key={item.materialId} className="border-b pb-4 last:border-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{item.materialName}</h3>
                          <p className="text-sm text-gray-600">
                            ₹{item.pricePerUnit} per {item.unit}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.materialId)}
                          className="text-red-600 hover:text-red-700 p-1"
                          title="Remove item"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                        <div className="flex items-center mb-2 sm:mb-0">
                          <label className="text-sm text-gray-600 mr-2">Qty:</label>
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.materialId, e.target.value)}
                            className="w-20 px-2 py-1 border rounded text-sm"
                          />
                          <span className="ml-1 text-sm text-gray-500">{item.unit}</span>
                        </div>
                        <div className="text-sm">
                          <div>Subtotal: ₹{subtotal.toFixed(2)}</div>
                          <div className="text-gray-600">GST: ₹{gst.toFixed(2)}</div>
                          <div className="font-medium">Total: ₹{total.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quotation Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <CalculatorIcon className="h-5 w-5 mr-2 text-primary-600" />
              Quotation Summary
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Labor Cost */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Labor Cost (₹)
                </label>
                <input
                  type="number"
                  name="laborCost"
                  min="0"
                  step="100"
                  value={formData.laborCost}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="0"
                />
              </div>

              {/* Transport Cost */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transport Cost (₹)
                </label>
                <input
                  type="number"
                  name="transportCost"
                  min="0"
                  step="100"
                  value={formData.transportCost}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="0"
                />
              </div>

              {/* Discount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    name="discount"
                    min="0"
                    step={formData.discountType === 'percentage' ? "1" : "100"}
                    value={formData.discount}
                    onChange={handleInputChange}
                    className="input-field flex-1"
                    placeholder="0"
                  />
                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleInputChange}
                    className="input-field w-24"
                  >
                    <option value="percentage">%</option>
                    <option value="fixed">₹</option>
                  </select>
                </div>
              </div>

              {/* Terms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Terms & Conditions
                </label>
                <textarea
                  name="terms"
                  rows="3"
                  value={formData.terms}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  rows="2"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Any special instructions..."
                />
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">₹{totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GST Total:</span>
                  <span className="font-medium">₹{totals.gstTotal.toFixed(2)}</span>
                </div>
                {formData.laborCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Labor:</span>
                    <span className="font-medium">₹{parseFloat(formData.laborCost).toFixed(2)}</span>
                  </div>
                )}
                {formData.transportCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Transport:</span>
                    <span className="font-medium">₹{parseFloat(formData.transportCost).toFixed(2)}</span>
                  </div>
                )}
                {formData.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount:</span>
                    <span>-₹{totals.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>₹{totals.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!selectedItems || selectedItems.length === 0 || submitting}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <Loader size="sm" />
                    <span className="ml-2">Creating...</span>
                  </span>
                ) : (
                  'Create & Send Quotation'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateQuotation;