import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  PhotoIcon,
  LightBulbIcon,
  ShoppingBagIcon,
  CheckCircleIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { designerService } from '../../services/designerService';
import { materialService } from '../../services/materialService';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const ProjectReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const [suggestions, setSuggestions] = useState({
    title: '',
    description: '',
    category: 'layout',
    materialRecommendations: [],
    notes: ''
  });
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectRes, materialsRes] = await Promise.all([
        designerService.getProjectForReview(id),
        materialService.getAllMaterials()
      ]);
      
      setProject(projectRes.data);
      setMaterials(materialsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load project');
      navigate('/designer/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMaterialRecommendation = () => {
    if (!selectedMaterial) return;
    
    setSuggestions(prev => ({
      ...prev,
      materialRecommendations: [
        ...prev.materialRecommendations,
        {
          materialId: selectedMaterial._id,
          materialName: selectedMaterial.name,
          category: selectedMaterial.category,
          quantity: 1,
          unit: selectedMaterial.unit,
          reason: '',
          priority: 'medium'
        }
      ]
    }));
    setSelectedMaterial(null);
  };

  const handleRemoveMaterial = (index) => {
    setSuggestions(prev => ({
      ...prev,
      materialRecommendations: prev.materialRecommendations.filter((_, i) => i !== index)
    }));
  };

  const handleMaterialChange = (index, field, value) => {
    setSuggestions(prev => ({
      ...prev,
      materialRecommendations: prev.materialRecommendations.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleSubmitSuggestions = async () => {
    if (!suggestions.title) {
      toast.error('Please add a title for your suggestions');
      return;
    }

    try {
      await designerService.addDesignSuggestions(id, suggestions);
      toast.success('Suggestions added successfully');
      setShowSuggestionForm(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to add suggestions');
    }
  };

  const handleSendToSeller = async () => {
    try {
      await designerService.sendToSeller(id);
      toast.success('Suggestions sent to seller');
      navigate('/designer/dashboard');
    } catch (error) {
      toast.error('Failed to send to seller');
    }
  };

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
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/designer/dashboard')}
            className="mr-4 text-gray-600 hover:text-primary-600"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
            <p className="text-gray-600">
              Customer: {project.customerId?.userId?.name}
            </p>
          </div>
        </div>
        
        {project.designerSuggestions?.length > 0 && (
          <button
            onClick={handleSendToSeller}
            className="btn-primary"
          >
            Send to Seller
          </button>
        )}
      </div>

      {/* Customer Photos */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <PhotoIcon className="h-5 w-5 mr-2 text-primary-600" />
          Customer Photos ({project.images?.length || 0})
        </h2>

        {project.images?.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {project.images.map((image, index) => (
              <div
                key={index}
                className="cursor-pointer hover:opacity-75 transition-opacity"
                onClick={() => setSelectedImage(image)}
              >
                <img
                  src={image.imageUrl}
                  alt={`Project ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No photos uploaded yet
          </p>
        )}
      </div>

      {/* Measurements */}
      {project.measurements?.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Measurements</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Area</th>
                  <th className="px-4 py-2 text-left">Dimensions</th>
                  <th className="px-4 py-2 text-left">Area (sq ft)</th>
                </tr>
              </thead>
              <tbody>
                {project.measurements.map((m, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2">{m.areaName}</td>
                    <td className="px-4 py-2">{m.length} × {m.width} {m.unit}</td>
                    <td className="px-4 py-2">{m.areaSqFt?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Design Suggestions */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <LightBulbIcon className="h-5 w-5 mr-2 text-yellow-500" />
            Design Suggestions
          </h2>
          {!showSuggestionForm && (
            <button
              onClick={() => setShowSuggestionForm(true)}
              className="btn-primary flex items-center text-sm"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Suggestions
            </button>
          )}
        </div>

        {showSuggestionForm ? (
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-medium mb-4">New Design Suggestions</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={suggestions.title}
                  onChange={(e) => setSuggestions(prev => ({ ...prev, title: e.target.value }))}
                  className="input-field"
                  placeholder="e.g., Kitchen Layout Suggestions"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={suggestions.category}
                  onChange={(e) => setSuggestions(prev => ({ ...prev, category: e.target.value }))}
                  className="input-field"
                >
                  <option value="layout">Layout</option>
                  <option value="color">Color Scheme</option>
                  <option value="material">Materials</option>
                  <option value="furniture">Furniture</option>
                  <option value="lighting">Lighting</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={suggestions.description}
                  onChange={(e) => setSuggestions(prev => ({ ...prev, description: e.target.value }))}
                  rows="4"
                  className="input-field"
                  placeholder="Describe your design suggestions in detail..."
                />
              </div>

              {/* Material Recommendations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Material Recommendations
                </label>
                
                <div className="flex space-x-2 mb-4">
                  <select
                    value={selectedMaterial?._id || ''}
                    onChange={(e) => {
                      const material = materials.find(m => m._id === e.target.value);
                      setSelectedMaterial(material);
                    }}
                    className="input-field flex-1"
                  >
                    <option value="">Select a material</option>
                    {materials.map(m => (
                      <option key={m._id} value={m._id}>
                        {m.name} - ₹{m.pricePerUnit}/{m.unit}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddMaterialRecommendation}
                    disabled={!selectedMaterial}
                    className="btn-primary px-4"
                  >
                    Add
                  </button>
                </div>

                {suggestions.materialRecommendations.map((item, index) => (
                  <div key={index} className="border rounded p-3 mb-3 bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{item.materialName}</h4>
                      <button
                        onClick={() => handleRemoveMaterial(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <label className="text-gray-600">Quantity:</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleMaterialChange(index, 'quantity', parseFloat(e.target.value))}
                          className="w-full px-2 py-1 border rounded"
                          min="0.01"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="text-gray-600">Unit:</label>
                        <span className="ml-1">{item.unit}</span>
                      </div>
                      <div className="col-span-2">
                        <label className="text-gray-600">Reason:</label>
                        <textarea
                          value={item.reason}
                          onChange={(e) => handleMaterialChange(index, 'reason', e.target.value)}
                          className="w-full px-2 py-1 border rounded text-sm"
                          rows="2"
                          placeholder="Why recommend this material?"
                        />
                      </div>
                      <div>
                        <label className="text-gray-600">Priority:</label>
                        <select
                          value={item.priority}
                          onChange={(e) => handleMaterialChange(index, 'priority', e.target.value)}
                          className="w-full px-2 py-1 border rounded"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  value={suggestions.notes}
                  onChange={(e) => setSuggestions(prev => ({ ...prev, notes: e.target.value }))}
                  rows="3"
                  className="input-field"
                  placeholder="Any additional notes or considerations..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowSuggestionForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitSuggestions}
                  className="btn-primary"
                >
                  Save Suggestions
                </button>
              </div>
            </div>
          </div>
        ) : project.designerSuggestions?.length > 0 ? (
          <div className="space-y-4">
            {project.designerSuggestions.map((suggestion, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{suggestion.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    suggestion.status === 'approved' ? 'bg-green-100 text-green-800' :
                    suggestion.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {suggestion.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                
                {suggestion.materialRecommendations?.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium mb-2">Recommended Materials:</h4>
                    <ul className="text-sm space-y-1">
                      {suggestion.materialRecommendations.map((rec, i) => (
                        <li key={i} className="flex justify-between">
                          <span>{rec.materialName} x {rec.quantity} {rec.unit}</span>
                          <span className="text-gray-500">{rec.reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No design suggestions yet. Click "Add Suggestions" to get started.
          </p>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <XMarkIcon className="h-8 w-8" />
          </button>
          <img
            src={selectedImage.imageUrl}
            alt="Project"
            className="max-w-full max-h-[90vh] object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default ProjectReview;