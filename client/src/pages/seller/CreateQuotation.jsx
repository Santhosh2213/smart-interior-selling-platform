import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getProjectById } from '../../services/projectService';
import { getAllMaterials } from '../../services/materialService';
import { createQuotation } from '../../services/quotationService';
import { 
  ArrowLeftIcon, 
  PlusIcon, 
  TrashIcon,
  CalculatorIcon,
  MagnifyingGlassIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  HomeIcon,
  PhotoIcon,
  CubeIcon,
  CurrencyRupeeIcon,
  DocumentTextIcon,
  CheckIcon,
  XMarkIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const CreateQuotation = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [project, setProject] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);
  const [showDesignInfo, setShowDesignInfo] = useState(false);
  const [designSuggestion, setDesignSuggestion] = useState(null);
  const [formData, setFormData] = useState({
    laborCost: 0,
    transportCost: 0,
    discount: 0,
    discountType: 'percentage',
    terms: '1. All prices are subject to GST\n2. Delivery charges extra\n3. Payment terms: 50% advance, 50% before delivery',
    notes: '',
    validUntil: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]
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

  useEffect(() => {
    if (projectId) {
      loadData();
    } else {
      toast.error('No project ID provided');
      navigate('/seller/queue');
    }
  }, [projectId]);

  // Check for pre-filled data from project details
  useEffect(() => {
    if (location.state?.designSuggestion && materials.length > 0) {
      const design = location.state.designSuggestion;
      setDesignSuggestion(design);
      
      if (design.recommendations && design.recommendations.length > 0) {
        const preFilledItems = design.recommendations.map(rec => {
          // Find the material in the materials list
          const material = materials.find(m => 
            m._id === (rec.materialId?._id || rec.materialId)
          );
          
          return {
            materialId: rec.materialId?._id || rec.materialId,
            materialName: rec.materialId?.name || material?.name || 'Material',
            quantity: rec.quantity || 1,
            pricePerUnit: material?.pricePerUnit || rec.materialId?.pricePerUnit || 0,
            unit: rec.unit || material?.unit || 'sqft',
            gstRate: material?.gstRate || rec.materialId?.gstRate || 18
          };
        });
        
        setSelectedItems(preFilledItems);
        toast.success(`Loaded ${preFilledItems.length} items from design suggestion`);
        setShowDesignInfo(true);
      }
    }
  }, [location.state, materials]);

  useEffect(() => {
    if (materials && materials.length > 0) {
      let filtered = [...materials];
      
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(m => m.category === selectedCategory);
      }
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(m => 
          m.name?.toLowerCase().includes(query) ||
          m.category?.toLowerCase().includes(query) ||
          m.description?.toLowerCase().includes(query)
        );
      }
      
      setFilteredMaterials(filtered);
    }
  }, [searchQuery, selectedCategory, materials]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch project data
      const projectResponse = await getProjectById(projectId);
      console.log('Project response:', projectResponse);
      
      // Fetch materials
      const materialsResponse = await getAllMaterials();
      console.log('Materials response:', materialsResponse);
      
      // Set project data
      let projectData = null;
      if (projectResponse && projectResponse.data) {
        projectData = projectResponse.data;
      } else if (projectResponse) {
        projectData = projectResponse;
      }
      
      // Check if project is already quoted and has quotations
      if (projectData && (projectData.status === 'quoted' || projectData.status === 'DESIGN_APPROVED') && 
          projectData.quotations && projectData.quotations.length > 0) {
        toast.success('This project already has a quotation. Redirecting to view it.');
        navigate(`/seller/quotations/${projectData.quotations[0]._id}`);
        return;
      }
      
      setProject(projectData);
      
      // Set materials data
      let materialsArray = [];
      if (materialsResponse && materialsResponse.data) {
        materialsArray = materialsResponse.data;
      } else if (Array.isArray(materialsResponse)) {
        materialsArray = materialsResponse;
      }
      
      console.log('Materials array:', materialsArray);
      setMaterials(materialsArray);
      setFilteredMaterials(materialsArray);
      
    } catch (error) {
      console.error('Error loading data:', error);
      
      // Handle 403 error specifically
      if (error.response?.status === 403) {
        toast.error('You do not have permission to access this project');
      } else {
        toast.error(error.response?.data?.error || 'Failed to load data');
      }
      
      navigate('/seller/queue');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = (material) => {
    if (!material) return;
    
    // Get the price - MUST use pricePerUnit from your database
    const pricePerUnit = Number(material.pricePerUnit) || 0;
    
    if (pricePerUnit <= 0) {
      toast.error(`${material.name} has no valid price`);
      return;
    }
  
    console.log('Adding material:', {
      id: material._id,
      name: material.name,
      pricePerUnit: pricePerUnit,
      gstRate: material.gstRate || 18,
      unit: material.unit || 'sqft'
    });
  
    setSelectedItems(prev => {
      // Check if item already exists
      const exists = prev.find(item => item.materialId === material._id);
      
      if (exists) {
        // Increase quantity if exists
        const newQuantity = (exists.quantity || 1) + 1;
        toast.success(`${material.name} quantity increased to ${newQuantity}`);
        return prev.map(item =>
          item.materialId === material._id
            ? { ...item, quantity: newQuantity }
            : item
        );
      }
      
      // Add new item with ALL required fields
      const newItem = {
        materialId: material._id,
        materialName: material.name || 'Unknown',
        quantity: 1,
        pricePerUnit: pricePerUnit,
        unit: material.unit || 'sqft',
        gstRate: material.gstRate || 18
      };
      
      console.log('New item created:', newItem);
      toast.success(`${material.name} added to quotation`);
      return [...prev, newItem];
    });
  };

  const handleRemoveItem = (materialId) => {
    setSelectedItems(prev => prev.filter(item => item.materialId !== materialId));
    toast.success('Item removed');
  };

  const handleQuantityChange = (materialId, value) => {
    const quantity = parseFloat(value);
    if (isNaN(quantity) || quantity < 0.01) return;
    
    setSelectedItems(prev =>
      prev.map(item =>
        item.materialId === materialId
          ? { ...item, quantity: quantity }
          : item
      )
    );
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (parseFloat(value) || 0) : value
    }));
  };

  const calculateItemTotals = (item) => {
    const quantity = Number(item.quantity) || 0;
    const pricePerUnit = Number(item.pricePerUnit) || 0;
    const gstRate = Number(item.gstRate) || 0;
    
    const subtotal = quantity * pricePerUnit;
    const gst = subtotal * (gstRate / 100);
    const total = subtotal + gst;
    
    return {
      subtotal: isNaN(subtotal) ? 0 : Number(subtotal.toFixed(2)),
      gst: isNaN(gst) ? 0 : Number(gst.toFixed(2)),
      total: isNaN(total) ? 0 : Number(total.toFixed(2))
    };
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let gstTotal = 0;

    selectedItems.forEach(item => {
      const { subtotal: itemSubtotal, gst: itemGst } = calculateItemTotals(item);
      subtotal += itemSubtotal;
      gstTotal += itemGst;
    });

    const laborCost = Number(formData.laborCost) || 0;
    const transportCost = Number(formData.transportCost) || 0;
    const discount = Number(formData.discount) || 0;
    
    let discountAmount = 0;
    if (discount > 0) {
      const totalBeforeDiscount = subtotal + gstTotal + laborCost + transportCost;
      if (formData.discountType === 'percentage') {
        discountAmount = totalBeforeDiscount * (discount / 100);
      } else {
        discountAmount = Math.min(discount, totalBeforeDiscount);
      }
    }

    const total = subtotal + gstTotal + laborCost + transportCost - discountAmount;

    return {
      subtotal: Number(subtotal.toFixed(2)),
      gstTotal: Number(gstTotal.toFixed(2)),
      laborCost: Number(laborCost.toFixed(2)),
      transportCost: Number(transportCost.toFixed(2)),
      discount: discount,
      discountAmount: Number(discountAmount.toFixed(2)),
      total: Number(total.toFixed(2))
    };
  };

  const validateForm = () => {
    if (selectedItems.length === 0) {
      toast.error('Please add at least one item');
      return false;
    }
  
    for (let i = 0; i < selectedItems.length; i++) {
      const item = selectedItems[i];
      
      if (item.pricePerUnit === undefined || item.pricePerUnit === null) {
        console.error(`Item ${i} missing pricePerUnit:`, item);
        toast.error(`${item.materialName || 'Item'} is missing price information`);
        return false;
      }
      
      const priceNum = Number(item.pricePerUnit);
      if (isNaN(priceNum) || priceNum <= 0) {
        toast.error(`${item.materialName || 'Item'} has invalid price: ${item.pricePerUnit}`);
        return false;
      }
      
      if (!item.quantity || item.quantity <= 0) {
        toast.error(`Quantity for ${item.materialName} must be greater than 0`);
        return false;
      }
    }
  
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
  
    setSubmitting(true);
  
    try {
      const totals = calculateTotals();
      
      const items = selectedItems.map(item => {
        const quantity = Number(item.quantity) || 0;
        const pricePerUnit = Number(item.pricePerUnit) || 0;
        const gstRate = Number(item.gstRate) || 0;
        const subtotal = quantity * pricePerUnit;
        const gstAmount = subtotal * (gstRate / 100);
        const total = subtotal + gstAmount;
        
        return {
          materialId: String(item.materialId || ''),
          materialName: String(item.materialName || 'Unknown'),
          quantity: quantity,
          unit: String(item.unit || 'sqft'),
          pricePerUnit: pricePerUnit,
          subtotal: Number(subtotal.toFixed(2)),
          gstRate: gstRate,
          gstAmount: Number(gstAmount.toFixed(2)),
          total: Number(total.toFixed(2))
        };
      });
  
      const quotationData = {
        projectId: String(projectId),
        items: items,
        subtotal: Number(totals.subtotal.toFixed(2)),
        gstTotal: Number(totals.gstTotal.toFixed(2)),
        laborCost: Number(totals.laborCost.toFixed(2)),
        transportCost: Number(totals.transportCost.toFixed(2)),
        discount: Number(totals.discount),
        discountType: String(formData.discountType),
        total: Number(totals.total.toFixed(2)),
        terms: String(formData.terms || ''),
        notes: String(formData.notes || ''),
        validUntil: new Date(formData.validUntil),
        status: 'draft'
      };
  
      console.log('Submitting quotation:', JSON.stringify(quotationData, null, 2));
      
      const response = await createQuotation(quotationData);
      console.log('Quotation created:', response);
      toast.success('Quotation created successfully!');
      navigate('/seller/quotations');
      
    } catch (error) {
      console.error('Error creating quotation:', error);
      if (error.response) {
        console.error('Server response:', error.response.data);
        toast.error(error.response.data?.error || 'Failed to create quotation');
      } else {
        toast.error(error.message || 'Failed to create quotation');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearDesignItems = () => {
    setSelectedItems([]);
    setShowDesignInfo(false);
    toast.success('Cleared design suggestion items');
  };

  const totals = calculateTotals();

  if (loading) { 
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Project not found</p>
          <button
            onClick={() => navigate('/seller/queue')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Queue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/seller/queue')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Queue
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Create Quotation</h1>
          <p className="text-sm text-gray-500 mt-1">Project: {project.title}</p>
        </div>
      </div>

      {/* Design Info Banner */}
      {showDesignInfo && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-2" />
              <p className="text-sm text-blue-700">
                Items from designer suggestion have been pre-filled. You can adjust quantities or add more items.
              </p>
            </div>
            <button
              onClick={handleClearDesignItems}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear Items
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Project Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-blue-500" />
                Customer Details
              </h2>
              <div className="space-y-3">
                <p className="flex items-center">
                  <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="font-medium">
                    {project.customerName || project.customerId?.name || project.customerId?.userId?.name || 'N/A'}
                  </span>
                </p>
                {(project.customerEmail || project.customerId?.email) && (
                  <p className="flex items-center">
                    <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span>{project.customerEmail || project.customerId?.email}</span>
                  </p>
                )}
                {(project.customerPhone || project.customerId?.phone) && (
                  <p className="flex items-center">
                    <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span>{project.customerPhone || project.customerId?.phone}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Measurements */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <HomeIcon className="h-5 w-5 mr-2 text-blue-500" />
                Measurements
              </h2>
              {project.measurements && project.measurements.length > 0 ? (
                <div className="space-y-3">
                  {project.measurements.map((m, index) => (
                    <div key={index} className="border-b last:border-0 pb-2 last:pb-0">
                      <p className="font-medium">Area {index + 1}: {m.areaName || ''}</p>
                      <p className="text-sm text-gray-600">
                        {m.length} × {m.width} {project.measurementUnit || 'feet'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Area: {(m.areaSqFt || m.area || 0).toFixed(2)} sq.{project.measurementUnit || 'ft'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No measurements added</p>
              )}
            </div>

            {/* Photos */}
            {project.images && project.images.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <PhotoIcon className="h-5 w-5 mr-2 text-blue-500" />
                  Photos
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {project.images.map((image, index) => (
                    <div 
                      key={index}
                      className="cursor-pointer group relative"
                      onClick={() => setSelectedImage(image.imageUrl)}
                    >
                      <img 
                        src={image.imageUrl} 
                        alt={`Project ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg flex items-center justify-center">
                        <PhotoIcon className="h-6 w-6 text-white opacity-0 group-hover:opacity-100" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Quotation Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Materials Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <CubeIcon className="h-5 w-5 mr-2 text-blue-500" />
                Available Materials
              </h2>
              
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search materials..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="sm:w-48">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
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

              {/* Materials Grid */}
              {filteredMaterials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto p-2">
                  {filteredMaterials.map((material) => {
                    const pricePerUnit = Number(material.pricePerUnit) || 0;
                    return (
                      <div
                        key={material._id}
                        onClick={() => handleAddItem(material)}
                        className={`border rounded-lg p-4 hover:shadow-md cursor-pointer transition-all hover:border-blue-300 hover:bg-blue-50 ${
                          pricePerUnit <= 0 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <h3 className="font-medium text-gray-900">{material.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">Category: {material.category}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-gray-500">Unit: {material.unit}</span>
                          <span className="font-semibold text-blue-600">
                            ₹{pricePerUnit.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">GST: {material.gstRate || 18}%</p>
                        {pricePerUnit <= 0 && (
                          <p className="text-xs text-red-500 mt-1">Price not set</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  {materials.length === 0 
                    ? 'No materials available. Please add materials first.'
                    : 'No materials match your filters'}
                </p>
              )}
            </div>

            {/* Selected Items */}
            {selectedItems.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Selected Items</h2>
                  {showDesignInfo && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      From Design
                    </span>
                  )}
                </div>
                <div className="space-y-4">
                  {selectedItems.map((item) => {
                    const { subtotal, gst, total } = calculateItemTotals(item);
                    return (
                      <div key={item.materialId} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium text-gray-900">{item.materialName}</h3>
                            <p className="text-sm text-gray-600">
                              ₹{Number(item.pricePerUnit).toFixed(2)} per {item.unit} • GST: {item.gstRate}%
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.materialId)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <label className="text-sm text-gray-600">Qty:</label>
                            <input
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.materialId, e.target.value)}
                              className="w-20 px-2 py-1 border rounded text-sm"
                            />
                            <span className="text-sm text-gray-500">{item.unit}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">Subtotal: ₹{subtotal.toFixed(2)}</p>
                            <p className="text-sm text-gray-600">GST: ₹{gst.toFixed(2)}</p>
                            <p className="font-medium">Total: ₹{total.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Additional Costs */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <CalculatorIcon className="h-5 w-5 mr-2 text-blue-500" />
                Additional Costs
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Labor Cost (₹)
                  </label>
                  <input
                    type="number"
                    name="laborCost"
                    value={formData.laborCost}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg"
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
                    name="transportCost"
                    value={formData.transportCost}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg"
                    min="0"
                    step="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      name="discount"
                      value={formData.discount}
                      onChange={handleInputChange}
                      className="flex-1 px-4 py-2 border rounded-l-lg"
                      min="0"
                      step={formData.discountType === 'percentage' ? '1' : '100'}
                    />
                    <select
                      name="discountType"
                      value={formData.discountType}
                      onChange={handleInputChange}
                      className="w-24 px-4 py-2 border rounded-r-lg"
                    >
                      <option value="percentage">%</option>
                      <option value="fixed">₹</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valid Until
                  </label>
                  <input
                    type="date"
                    name="validUntil"
                    value={formData.validUntil}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Terms & Notes */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-500" />
                Terms & Notes
              </h2>
              
              <div className="space-y-4">
                <textarea
                  name="terms"
                  value={formData.terms}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Any special instructions..."
                />
              </div>
            </div>

            {/* Quotation Summary */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <CurrencyRupeeIcon className="h-5 w-5 mr-2" />
                Quotation Summary
              </h2>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST Total:</span>
                  <span>₹{totals.gstTotal.toFixed(2)}</span>
                </div>
                {totals.laborCost > 0 && (
                  <div className="flex justify-between">
                    <span>Labor Cost:</span>
                    <span>₹{totals.laborCost.toFixed(2)}</span>
                  </div>
                )}
                {totals.transportCost > 0 && (
                  <div className="flex justify-between">
                    <span>Transport Cost:</span>
                    <span>₹{totals.transportCost.toFixed(2)}</span>
                  </div>
                )}
                {totals.discount > 0 && (
                  <div className="flex justify-between text-yellow-200">
                    <span>Discount ({formData.discountType === 'percentage' ? `${totals.discount}%` : 'Fixed'}):</span>
                    <span>-₹{totals.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-white/30 my-2 pt-2">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total:</span>
                    <span>₹{totals.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/seller/queue')}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || selectedItems.length === 0}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {submitting ? (
                  <>
                    <Loader size="sm" />
                    <span className="ml-2">Creating...</span>
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-5 w-5 mr-2" />
                    Create Quotation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-full relative">
            <img src={selectedImage} alt="Full size" className="max-w-full max-h-full object-contain" />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateQuotation;