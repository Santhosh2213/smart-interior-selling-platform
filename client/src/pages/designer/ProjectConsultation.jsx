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
  CalendarIcon
} from '@heroicons/react/24/outline';

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
        updated[index].estimatedCost = material.price * updated[index].quantity;
      }
    }
    
    setRecommendations(updated);
  };

  const handleRemoveRecommendation = (index) => {
    setRecommendations(recommendations.filter((_, i) => i !== index));
  };

  const handleSubmit = async (status = 'SUBMITTED') => {
    // Validate form
    if (status === 'SUBMITTED') {
      if (recommendations.length === 0) {
        alert('Please add at least one material recommendation');
        return;
      }
      
      // Check if all recommendations have required fields
      const invalidRecs = recommendations.filter(r => !r.areaId || !r.materialId || r.quantity <= 0);
      if (invalidRecs.length > 0) {
        alert('Please fill in all required fields for each recommendation');
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
        navigate('/designer/queue', { 
          state: { message: 'Design suggestion submitted successfully!' } 
        });
      } else {
        alert('Design suggestion saved as draft');
      }
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      alert(error.response?.data?.error || 'Failed to submit suggestion');
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
          <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
          <p className="text-gray-600">
            Project ID: {project._id}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Project Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-gray-500" />
                Customer Details
              </h2>
              <div className="space-y-3">
                <p className="flex items-center">
                  <span className="text-gray-600 w-20">Name:</span>
                  <span className="font-medium">{project.customerName || 'N/A'}</span>
                </p>
                {project.customerEmail && (
                  <p className="flex items-center">
                    <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{project.customerEmail}</span>
                  </p>
                )}
                {project.customerPhone && (
                  <p className="flex items-center">
                    <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{project.customerPhone}</span>
                  </p>
                )}
                <p className="flex items-center text-sm text-gray-500">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Submitted: {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Measurements */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <HomeIcon className="h-5 w-5 mr-2 text-gray-500" />
                Measurements ({project.measurements?.length || 0})
              </h2>
              {project.measurements && project.measurements.length > 0 ? (
                <div className="space-y-4">
                  {project.measurements.map((m, index) => (
                    <div key={m._id || index} className="border-b last:border-0 pb-3 last:pb-0">
                      <div className="flex items-center mb-1">
                        <span className="font-medium">Area {index + 1}</span>
                      </div>
                      <p className="text-sm text-gray-600 ml-2">
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
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <PhotoIcon className="h-5 w-5 mr-2 text-gray-500" />
                Photos ({project.images?.length || 0})
              </h2>
              {project.images && project.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
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

          {/* Right Column - Design Suggestions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recommendations */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Material Recommendations</h2>
                <button
                  onClick={handleAddRecommendation}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  + Add Material
                </button>
              </div>

              {recommendations.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No materials added yet. Click "Add Material" to start.
                </p>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between mb-2">
                        <h3 className="font-medium">Material {index + 1}</h3>
                        <button
                          onClick={() => handleRemoveRecommendation(index)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <select
                          value={rec.areaId}
                          onChange={(e) => handleRecommendationChange(index, 'areaId', e.target.value)}
                          className="border rounded px-2 py-1 text-sm"
                          required
                        >
                          <option value="">Select Area</option>
                          {project.measurements?.map((m, i) => (
                            <option key={m._id} value={m._id}>
                              Area {i + 1} ({(m.areaSqFt || m.area || 0).toFixed(2)} sq{project.measurementUnit})
                            </option>
                          ))}
                        </select>

                        <select
                          value={rec.materialId}
                          onChange={(e) => handleRecommendationChange(index, 'materialId', e.target.value)}
                          className="border rounded px-2 py-1 text-sm"
                          required
                        >
                          <option value="">Select Material</option>
                          {materials.map(m => (
                            <option key={m._id} value={m._id}>
                              {m.name} - ₹{m.price}/{m.unit}
                            </option>
                          ))}
                        </select>

                        <input
                          type="number"
                          placeholder="Quantity"
                          value={rec.quantity}
                          onChange={(e) => handleRecommendationChange(index, 'quantity', parseFloat(e.target.value))}
                          className="border rounded px-2 py-1 text-sm"
                          min="0"
                          step="0.01"
                          required
                        />

                        <select
                          value={rec.unit}
                          onChange={(e) => handleRecommendationChange(index, 'unit', e.target.value)}
                          className="border rounded px-2 py-1 text-sm"
                        >
                          <option value="sqft">Sq Ft</option>
                          <option value="sqm">Sq M</option>
                          <option value="pieces">Pieces</option>
                          <option value="boxes">Boxes</option>
                          <option value="liters">Liters</option>
                          <option value="kg">Kg</option>
                        </select>

                        <input
                          type="text"
                          placeholder="Notes (optional)"
                          value={rec.notes}
                          onChange={(e) => handleRecommendationChange(index, 'notes', e.target.value)}
                          className="border rounded px-2 py-1 text-sm col-span-2"
                        />

                        {rec.estimatedCost > 0 && (
                          <div className="col-span-2 text-right text-sm">
                            <span className="text-gray-600">Estimated: </span>
                            <span className="font-medium">₹{rec.estimatedCost.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Design Notes */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Design Notes</h2>
              <textarea
                value={designNotes}
                onChange={(e) => setDesignNotes(e.target.value)}
                placeholder="Add your design suggestions, notes, and recommendations..."
                className="w-full border rounded-lg p-3 h-32"
              />
            </div>

            {/* Theme & Color Scheme */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Theme & Color Scheme</h2>
              
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">Suggested Theme</label>
                <input
                  type="text"
                  value={suggestedTheme}
                  onChange={(e) => setSuggestedTheme(e.target.value)}
                  placeholder="e.g., Modern, Traditional, Minimalist"
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Primary Color</label>
                  <input
                    type="color"
                    value={colorScheme.primary}
                    onChange={(e) => setColorScheme({...colorScheme, primary: e.target.value})}
                    className="w-full h-10"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Secondary Color</label>
                  <input
                    type="color"
                    value={colorScheme.secondary}
                    onChange={(e) => setColorScheme({...colorScheme, secondary: e.target.value})}
                    className="w-full h-10"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Accent Color</label>
                  <input
                    type="color"
                    value={colorScheme.accent}
                    onChange={(e) => setColorScheme({...colorScheme, accent: e.target.value})}
                    className="w-full h-10"
                  />
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Estimated Timeline (Days)</h2>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Design</label>
                  <input
                    type="number"
                    value={estimatedTimeline.designDays}
                    onChange={(e) => setEstimatedTimeline({...estimatedTimeline, designDays: parseInt(e.target.value)})}
                    className="w-full border rounded px-3 py-2"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Procurement</label>
                  <input
                    type="number"
                    value={estimatedTimeline.materialProcurementDays}
                    onChange={(e) => setEstimatedTimeline({...estimatedTimeline, materialProcurementDays: parseInt(e.target.value)})}
                    className="w-full border rounded px-3 py-2"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Installation</label>
                  <input
                    type="number"
                    value={estimatedTimeline.installationDays}
                    onChange={(e) => setEstimatedTimeline({...estimatedTimeline, installationDays: parseInt(e.target.value)})}
                    className="w-full border rounded px-3 py-2"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Total Estimated Cost */}
            {recommendations.length > 0 && (
              <div className="bg-blue-50 rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-2">Total Estimated Cost</h2>
                <p className="text-3xl font-bold text-blue-600">
                  ₹{recommendations.reduce((sum, r) => sum + (r.estimatedCost || 0), 0).toLocaleString()}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 sticky bottom-4 bg-white p-4 rounded-lg shadow-lg">
              <button
                onClick={() => handleSubmit('DRAFT')}
                disabled={submitting}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Save Draft
              </button>
              <button
                onClick={() => handleSubmit('SUBMITTED')}
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Suggestions'}
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
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectConsultation;