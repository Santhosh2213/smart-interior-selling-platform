import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getProjectForDesign,
  createDesignSuggestion,
  getMaterials 
} from '../../services/designerService';
import Loader from '../../components/common/Loader';
import { 
  ArrowLeftIcon, 
  PhotoIcon,
  HomeIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  PlusIcon,
  TrashIcon,
  CubeIcon,
  DocumentTextIcon,
  PaintBrushIcon,
  ClockIcon,
  CurrencyRupeeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ProjectConsultation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [existingSuggestion, setExistingSuggestion] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('recommendations');
  
  // Form state
  const [recommendations, setRecommendations] = useState([]);
  const [designNotes, setDesignNotes] = useState('');
  const [suggestedTheme, setSuggestedTheme] = useState('');
  const [colorScheme, setColorScheme] = useState({
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B'
  });
  const [estimatedTimeline, setEstimatedTimeline] = useState({
    designDays: 3,
    materialProcurementDays: 5,
    installationDays: 7
  });

  useEffect(() => {
    console.log('ProjectConsultation mounted with ID:', id);
    if (id) {
      loadProjectData();
    } else {
      setError('No project ID provided');
      setLoading(false);
    }
  }, [id]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading project data for ID:', id);
      
      const [projectData, materialsData] = await Promise.all([
        getProjectForDesign(id),
        getMaterials()
      ]);
      
      console.log('Project data received:', projectData);
      console.log('Materials received:', materialsData);
      
      setProject(projectData.project);
      setExistingSuggestion(projectData.existingSuggestion);
      setMaterials(materialsData);
      
      // If there's an existing suggestion, populate the form
      if (projectData.existingSuggestion) {
        const suggestion = projectData.existingSuggestion;
        setRecommendations(suggestion.recommendations || []);
        setDesignNotes(suggestion.designNotes || '');
        setSuggestedTheme(suggestion.suggestedTheme || '');
        setColorScheme(suggestion.colorScheme || { 
          primary: '#3B82F6', 
          secondary: '#10B981', 
          accent: '#F59E0B' 
        });
        setEstimatedTimeline(suggestion.estimatedTimeline || {
          designDays: 3,
          materialProcurementDays: 5,
          installationDays: 7
        });
      }
    } catch (error) {
      console.error('Error loading project:', error);
      setError(error.response?.data?.error || error.message || 'Failed to load project');
      toast.error('Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecommendation = () => {
    setRecommendations([
      ...recommendations,
      {
        areaId: '',
        materialId: '',
        quantity: 0,
        unit: 'sqft',
        notes: '',
        estimatedCost: 0
      }
    ]);
  };

  const handleRecommendationChange = (index, field, value) => {
    const updated = [...recommendations];
    updated[index][field] = value;
    
    // Calculate estimated cost if material and quantity are selected
    if (field === 'materialId' || field === 'quantity') {
      const material = materials.find(m => m._id === updated[index].materialId);
      if (material && updated[index].quantity > 0) {
        const price = material.pricePerUnit || material.price || 0;
        updated[index].estimatedCost = price * updated[index].quantity;
        updated[index].unit = material.unit || updated[index].unit;
      }
    }
    
    setRecommendations(updated);
  };

  const handleRemoveRecommendation = (index) => {
    setRecommendations(recommendations.filter((_, i) => i !== index));
  };

  const calculateTotalCost = () => {
    return recommendations.reduce((sum, r) => sum + (r.estimatedCost || 0), 0);
  };

  const validateRecommendations = () => {
    for (let i = 0; i < recommendations.length; i++) {
      const rec = recommendations[i];
      if (!rec.areaId) {
        toast.error(`Please select an area for Material ${i + 1}`);
        return false;
      }
      if (!rec.materialId) {
        toast.error(`Please select a material for Material ${i + 1}`);
        return false;
      }
      if (!rec.quantity || rec.quantity <= 0) {
        toast.error(`Please enter a valid quantity for Material ${i + 1}`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (status = 'SUBMITTED') => {
    // Validate form
    if (status === 'SUBMITTED') {
      if (recommendations.length === 0) {
        toast.error('Please add at least one material recommendation');
        return;
      }
      
      if (!validateRecommendations()) {
        return;
      }
    }
    
    setSubmitting(true);
    try {
      const suggestionData = {
        projectId: id,
        recommendations,
        designNotes,
        suggestedTheme,
        colorScheme,
        estimatedTimeline,
        status
      };
      
      console.log('Submitting suggestion:', suggestionData);
      
      const response = await createDesignSuggestion(suggestionData);
      console.log('Submission response:', response);
      
      if (status === 'SUBMITTED') {
        toast.success('Design suggestion submitted successfully!');
        navigate('/designer/queue');
      } else {
        toast.success('Design suggestion saved as draft');
      }
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      toast.error(error.response?.data?.error || 'Failed to submit suggestion');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader />
          <p className="mt-4 text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 text-red-700 p-6 rounded-lg max-w-md">
            <h2 className="text-xl font-bold mb-2">Error Loading Project</h2>
            <p className="mb-4">{error}</p>
            <button
              onClick={() => navigate('/designer/queue')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Back to Queue
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Project not found</p>
          <button
            onClick={() => navigate('/designer/queue')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Queue
          </button>
        </div>
      </div>
    );
  }

  const totalCost = calculateTotalCost();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/designer/queue')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Queue
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
              <p className="text-sm text-gray-500 mt-1">Project ID: {project._id}</p>
            </div>
            <div className="flex space-x-2">
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                {project.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'recommendations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Recommendations
            </button>
            <button
              onClick={() => setActiveTab('project-details')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'project-details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Project Details
            </button>
            <button
              onClick={() => setActiveTab('design')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'design'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Design & Theme
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'project-details' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-blue-500" />
                Customer Details
              </h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <UserIcon className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="font-medium">{project.customerName || 'N/A'}</span>
                </div>
                {project.customerEmail && (
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-3" />
                    <span>{project.customerEmail}</span>
                  </div>
                )}
                {project.customerPhone && (
                  <div className="flex items-center">
                    <PhoneIcon className="h-4 w-4 text-gray-400 mr-3" />
                    <span>{project.customerPhone}</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-500">
                  <CalendarIcon className="h-4 w-4 mr-3" />
                  <span>Submitted: {new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Measurements */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <HomeIcon className="h-5 w-5 mr-2 text-blue-500" />
                Measurements ({project.measurements?.length || 0})
              </h2>
              {project.measurements && project.measurements.length > 0 ? (
                <div className="space-y-4">
                  {project.measurements.map((m, index) => (
                    <div key={m._id || index} className="border-b last:border-0 pb-3 last:pb-0">
                      <p className="font-medium">Area {index + 1}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {m.length} × {m.width} {project.measurementUnit}<br />
                        Area: {(m.areaSqFt || m.area || 0).toFixed(2)} sq.{project.measurementUnit}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No measurements added</p>
              )}
            </div>

            {/* Photos */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <PhotoIcon className="h-5 w-5 mr-2 text-blue-500" />
                Photos ({project.images?.length || 0})
              </h2>
              {project.images && project.images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {project.images.map((image, index) => (
                    <div 
                      key={image._id || index}
                      className="relative cursor-pointer group aspect-square"
                      onClick={() => setSelectedImage(image.imageUrl)}
                    >
                      <img 
                        src={image.imageUrl} 
                        alt={`Project ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg flex items-center justify-center">
                        <PhotoIcon className="h-6 w-6 text-white opacity-0 group-hover:opacity-100" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No photos uploaded</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'design' && (
          <div className="space-y-6">
            {/* Design Notes */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-500" />
                Design Notes
              </h2>
              <textarea
                value={designNotes}
                onChange={(e) => setDesignNotes(e.target.value)}
                placeholder="Add your design suggestions, notes, and recommendations..."
                className="w-full border rounded-lg p-4 h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Theme & Color Scheme */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <PaintBrushIcon className="h-5 w-5 mr-2 text-blue-500" />
                Theme & Color Scheme
              </h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Suggested Theme
                </label>
                <input
                  type="text"
                  value={suggestedTheme}
                  onChange={(e) => setSuggestedTheme(e.target.value)}
                  placeholder="e.g., Modern, Traditional, Minimalist"
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={colorScheme.primary}
                      onChange={(e) => setColorScheme({...colorScheme, primary: e.target.value})}
                      className="w-12 h-12 rounded border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={colorScheme.primary}
                      onChange={(e) => setColorScheme({...colorScheme, primary: e.target.value})}
                      className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={colorScheme.secondary}
                      onChange={(e) => setColorScheme({...colorScheme, secondary: e.target.value})}
                      className="w-12 h-12 rounded border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={colorScheme.secondary}
                      onChange={(e) => setColorScheme({...colorScheme, secondary: e.target.value})}
                      className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="#10B981"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accent Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={colorScheme.accent}
                      onChange={(e) => setColorScheme({...colorScheme, accent: e.target.value})}
                      className="w-12 h-12 rounded border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={colorScheme.accent}
                      onChange={(e) => setColorScheme({...colorScheme, accent: e.target.value})}
                      className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="#F59E0B"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2 text-blue-500" />
                Estimated Timeline (Days)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Design Phase
                  </label>
                  <input
                    type="number"
                    value={estimatedTimeline.designDays}
                    onChange={(e) => setEstimatedTimeline({...estimatedTimeline, designDays: parseInt(e.target.value)})}
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Procurement
                  </label>
                  <input
                    type="number"
                    value={estimatedTimeline.materialProcurementDays}
                    onChange={(e) => setEstimatedTimeline({...estimatedTimeline, materialProcurementDays: parseInt(e.target.value)})}
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Installation
                  </label>
                  <input
                    type="number"
                    value={estimatedTimeline.installationDays}
                    onChange={(e) => setEstimatedTimeline({...estimatedTimeline, installationDays: parseInt(e.target.value)})}
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            {/* Recommendations */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold flex items-center">
                  <CubeIcon className="h-5 w-5 mr-2 text-blue-500" />
                  Material Recommendations
                </h2>
                <button
                  onClick={handleAddRecommendation}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Material
                </button>
              </div>

              {recommendations.length === 0 ? (
                <div className="text-center py-12">
                  <CubeIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No materials added yet.</p>
                  <button
                    onClick={handleAddRecommendation}
                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 inline-flex items-center"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Your First Material
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((rec, index) => {
                    const material = materials.find(m => m._id === rec.materialId);
                    return (
                      <div key={index} className="border rounded-lg p-6 bg-gray-50 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center">
                            <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3">
                              {index + 1}
                            </span>
                            <h3 className="font-medium text-gray-900">
                              {material ? material.name : 'Select a material'}
                            </h3>
                          </div>
                          <button
                            onClick={() => handleRemoveRecommendation(index)}
                            className="text-red-600 hover:text-red-700 p-1"
                            title="Remove"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {/* Area Selection */}
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Select Area *
                            </label>
                            <select
                              value={rec.areaId}
                              onChange={(e) => handleRecommendationChange(index, 'areaId', e.target.value)}
                              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                              required
                            >
                              <option value="">Choose an area</option>
                              {project.measurements?.map((m, i) => (
                                <option key={m._id} value={m._id}>
                                  Area {i + 1} ({(m.areaSqFt || m.area || 0).toFixed(2)} sq{project.measurementUnit})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Material Selection */}
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Select Material *
                            </label>
                            <select
                              value={rec.materialId}
                              onChange={(e) => handleRecommendationChange(index, 'materialId', e.target.value)}
                              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                              required
                            >
                              <option value="">Choose a material</option>
                              {materials.map(m => (
                                <option key={m._id} value={m._id}>
                                  {m.name} - ₹{m.pricePerUnit || m.price || 0}/{m.unit}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Quantity */}
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Quantity *
                            </label>
                            <input
                              type="number"
                              placeholder="Enter quantity"
                              value={rec.quantity}
                              onChange={(e) => handleRecommendationChange(index, 'quantity', parseFloat(e.target.value))}
                              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              min="0"
                              step="0.01"
                              required
                            />
                          </div>

                          {/* Unit */}
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Unit
                            </label>
                            <select
                              value={rec.unit}
                              onChange={(e) => handleRecommendationChange(index, 'unit', e.target.value)}
                              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                              <option value="sqft">Sq Ft</option>
                              <option value="sqm">Sq M</option>
                              <option value="pieces">Pieces</option>
                              <option value="boxes">Boxes</option>
                              <option value="liters">Liters</option>
                              <option value="kg">Kg</option>
                            </select>
                          </div>
                        </div>

                        {/* Notes */}
                        <div className="mt-4">
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Notes (optional)
                          </label>
                          <input
                            type="text"
                            placeholder="Add any notes about this material..."
                            value={rec.notes}
                            onChange={(e) => handleRecommendationChange(index, 'notes', e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        {/* Estimated Cost */}
                        {rec.estimatedCost > 0 && (
                          <div className="mt-4 bg-blue-50 p-3 rounded-lg flex items-center justify-between">
                            <div className="flex items-center text-blue-700">
                              <CurrencyRupeeIcon className="h-4 w-4 mr-1" />
                              <span className="text-sm font-medium">Estimated Cost:</span>
                            </div>
                            <span className="font-bold text-blue-700">₹{rec.estimatedCost.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Total Cost Summary */}
            {recommendations.length > 0 && totalCost > 0 && (
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold mb-1 flex items-center">
                      <CurrencyRupeeIcon className="h-5 w-5 mr-2" />
                      Total Estimated Cost
                    </h2>
                    <p className="text-sm text-blue-100">Excluding taxes and delivery</p>
                  </div>
                  <p className="text-3xl font-bold">₹{totalCost.toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons - Always visible */}
        <div className="mt-8 flex justify-end space-x-4 sticky bottom-4">
          <button
            onClick={() => handleSubmit('DRAFT')}
            disabled={submitting}
            className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            onClick={() => handleSubmit('SUBMITTED')}
            disabled={submitting}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-lg"
          >
            {submitting ? 'Submitting...' : 'Submit Design Suggestions'}
          </button>
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
              <span className="text-2xl">&times;</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectConsultation;