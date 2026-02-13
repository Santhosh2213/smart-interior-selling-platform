import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { materialService } from '../../services/materialService';
import { projectService } from '../../services/projectService';
import { 
  ArrowLeftIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  ShoppingCartIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const MaterialSelection = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

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
  }, [id]);

  const fetchData = async () => {
    try {
      const [projectRes, materialsRes] = await Promise.all([
        projectService.getProjectById(id),
        materialService.getAllMaterials()
      ]);
      
      setProject(projectRes.data);
      setMaterials(materialsRes.data);
      setFilteredMaterials(materialsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = materials;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(m => m.category === selectedCategory);
    }
    
    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredMaterials(filtered);
  }, [selectedCategory, searchQuery, materials]);

  const handleSelectMaterial = (material) => {
    setSelectedMaterials(prev => {
      const exists = prev.find(m => m._id === material._id);
      if (exists) {
        return prev.filter(m => m._id !== material._id);
      } else {
        return [...prev, { ...material, quantity: 1 }];
      }
    });
  };

  const handleQuantityChange = (materialId, quantity) => {
    setSelectedMaterials(prev =>
      prev.map(m =>
        m._id === materialId ? { ...m, quantity: parseFloat(quantity) || 0 } : m
      )
    );
  };

  const handleContinue = () => {
    if (selectedMaterials.length === 0) {
      toast.error('Please select at least one material');
      return;
    }
    
    // Store selected materials in session/local storage
    localStorage.setItem(`project_${id}_materials`, JSON.stringify(selectedMaterials));
    navigate(`/customer/projects/${id}/materials/summary`);
  };

  const calculateTotal = () => {
    return selectedMaterials.reduce((sum, m) => {
      return sum + (m.pricePerUnit * m.quantity);
    }, 0);
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
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(`/customer/projects/${id}`)}
          className="mr-4 text-gray-600 hover:text-primary-600"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Select Materials</h1>
          <p className="text-gray-600">Choose materials for {project?.title}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Materials List */}
        <div className="lg:col-span-2">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
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
              
              {/* Category Filter */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMaterials.map((material) => {
              const isSelected = selectedMaterials.some(m => m._id === material._id);
              
              return (
                <div
                  key={material._id}
                  className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-primary-600' : 'hover:shadow-md'
                  }`}
                  onClick={() => handleSelectMaterial(material)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{material.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{material.category}</p>
                    </div>
                    {isSelected && (
                      <CheckCircleIcon className="h-5 w-5 text-primary-600" />
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-600">Unit: {material.unit}</span>
                    <span className="text-lg font-bold text-primary-600">
                      ₹{material.pricePerUnit}/{material.unit}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    GST: {material.gstRate}% | HSN: {material.hsnCode || 'N/A'}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredMaterials.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">No materials found</p>
            </div>
          )}
        </div>

        {/* Selected Materials Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <ShoppingCartIcon className="h-5 w-5 mr-2 text-primary-600" />
              Selected Materials ({selectedMaterials.length})
            </h2>

            {selectedMaterials.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">
                No materials selected yet
              </p>
            ) : (
              <>
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {selectedMaterials.map((material) => (
                    <div key={material._id} className="border-b pb-3">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-sm">{material.name}</span>
                        <button
                          onClick={() => handleSelectMaterial(material)}
                          className="text-red-600 text-xs hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600 mr-2">Qty:</span>
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={material.quantity}
                            onChange={(e) => handleQuantityChange(material._id, e.target.value)}
                            className="w-20 px-2 py-1 border rounded text-sm"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="text-xs text-gray-500 ml-1">{material.unit}</span>
                        </div>
                        <span className="font-medium text-sm">
                          ₹{(material.pricePerUnit * material.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Subtotal:</span>
                    <span className="font-bold">₹{calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    *GST will be added in quotation
                  </div>
                </div>

                <button
                  onClick={handleContinue}
                  className="w-full btn-primary"
                >
                  Continue to Summary
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialSelection;