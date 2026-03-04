import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectById } from '../../services/projectService';
import { 
  ArrowLeftIcon, 
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  HomeIcon,
  PhotoIcon,
  CubeIcon,
  DocumentTextIcon,
  ClockIcon,
  PaintBrushIcon,
  CurrencyRupeeIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const ProjectDetailsView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [designSuggestion, setDesignSuggestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (id) {
      loadProjectDetails();
    } else {
      toast.error('No project ID provided');
      navigate('/seller/queue');
    }
  }, [id]);

  const loadProjectDetails = async () => {
    try {
      setLoading(true);
      const response = await getProjectById(id);
      const projectData = response.data || response;
      setProject(projectData);
      
      // Check if there's a design suggestion
      if (projectData.designSuggestionId) {
        // You might need to fetch the design suggestion separately
        // This assumes it's populated in the project response
        setDesignSuggestion(projectData.designSuggestionId);
      }
      
    } catch (error) {
      console.error('Error loading project details:', error);
      toast.error('Failed to load project details');
      navigate('/seller/queue');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuotation = () => {
    navigate(`/seller/quotations/create/${id}`);
  };

  const calculateTotalEstimatedCost = () => {
    if (!designSuggestion?.recommendations) return 0;
    return designSuggestion.recommendations.reduce((sum, rec) => sum + (rec.estimatedCost || 0), 0);
  };

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

  const totalEstimatedCost = calculateTotalEstimatedCost();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/seller/queue')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to Queue
            </button>
            <button
              onClick={handleCreateQuotation}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <CurrencyRupeeIcon className="h-5 w-5 mr-2" />
              Create Quotation
            </button>
          </div>
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Project ID: {project._id} • Status: <span className="font-medium capitalize">{project.status}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Project Details
            </button>
            <button
              onClick={() => setActiveTab('design')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'design'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Designer Suggestions
            </button>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'details' ? (
          /* Project Details Tab */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Customer & Project Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Customer Details */}
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

              {/* Project Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Project Info</h2>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-600">Created:</span> {new Date(project.createdAt).toLocaleDateString()}</p>
                  {project.submittedAt && (
                    <p><span className="text-gray-600">Submitted:</span> {new Date(project.submittedAt).toLocaleDateString()}</p>
                  )}
                  <p><span className="text-gray-600">Measurement Unit:</span> {project.measurementUnit || 'feet'}</p>
                  <p><span className="text-gray-600">Total Area:</span> {(project.totalArea || 0).toFixed(2)} sq.{project.measurementUnit || 'ft'}</p>
                </div>
              </div>
            </div>

            {/* Right Column - Measurements & Photos */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              {project.description && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold mb-2">Description</h2>
                  <p className="text-gray-600">{project.description}</p>
                </div>
              )}

              {/* Measurements */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <HomeIcon className="h-5 w-5 mr-2 text-blue-500" />
                  Measurements ({project.measurements?.length || 0})
                </h2>
                {project.measurements && project.measurements.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {project.measurements.map((m, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <p className="font-medium text-gray-900">{m.areaName || `Area ${index + 1}`}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {m.length} × {m.width} {project.measurementUnit || 'feet'}
                        </p>
                        <p className="text-sm font-medium text-blue-600 mt-1">
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
                    Photos ({project.images.length})
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {project.images.map((image, index) => (
                      <div 
                        key={index}
                        className="cursor-pointer group relative aspect-square"
                        onClick={() => setSelectedImage(image.imageUrl)}
                      >
                        <img 
                          src={image.imageUrl} 
                          alt={`Project ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
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
          </div>
        ) : (
          /* Designer Suggestions Tab */
          <div className="space-y-6">
            {designSuggestion ? (
              <>
                {/* Design Summary */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold mb-1">Design Summary</h2>
                      <p className="text-sm text-blue-100">Version {designSuggestion.version}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">Total Estimated Cost</p>
                      <p className="text-2xl font-bold">₹{totalEstimatedCost.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Theme & Color Scheme */}
                {(designSuggestion.suggestedTheme || designSuggestion.colorScheme) && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center">
                      <PaintBrushIcon className="h-5 w-5 mr-2 text-blue-500" />
                      Theme & Color Scheme
                    </h2>
                    {designSuggestion.suggestedTheme && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Suggested Theme</p>
                        <p className="font-medium">{designSuggestion.suggestedTheme}</p>
                      </div>
                    )}
                    {designSuggestion.colorScheme && (
                      <div className="flex space-x-6">
                        {designSuggestion.colorScheme.primary && (
                          <div>
                            <div className="w-12 h-12 rounded-full mb-1" style={{ backgroundColor: designSuggestion.colorScheme.primary }} />
                            <p className="text-xs text-gray-500">Primary</p>
                          </div>
                        )}
                        {designSuggestion.colorScheme.secondary && (
                          <div>
                            <div className="w-12 h-12 rounded-full mb-1" style={{ backgroundColor: designSuggestion.colorScheme.secondary }} />
                            <p className="text-xs text-gray-500">Secondary</p>
                          </div>
                        )}
                        {designSuggestion.colorScheme.accent && (
                          <div>
                            <div className="w-12 h-12 rounded-full mb-1" style={{ backgroundColor: designSuggestion.colorScheme.accent }} />
                            <p className="text-xs text-gray-500">Accent</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Material Recommendations */}
                {designSuggestion.recommendations && designSuggestion.recommendations.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center">
                      <CubeIcon className="h-5 w-5 mr-2 text-blue-500" />
                      Material Recommendations
                    </h2>
                    <div className="space-y-4">
                      {designSuggestion.recommendations.map((rec, index) => {
                        const material = rec.materialId;
                        return (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-gray-900">
                                  {material?.name || 'Material'} 
                                  <span className="text-sm text-gray-500 ml-2">x {rec.quantity} {rec.unit}</span>
                                </h3>
                                {rec.notes && (
                                  <p className="text-sm text-gray-600 mt-1">{rec.notes}</p>
                                )}
                              </div>
                              {rec.estimatedCost > 0 && (
                                <span className="font-semibold text-blue-600">
                                  ₹{rec.estimatedCost.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Design Notes */}
                {designSuggestion.designNotes && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center">
                      <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-500" />
                      Design Notes
                    </h2>
                    <p className="text-gray-700 whitespace-pre-wrap">{designSuggestion.designNotes}</p>
                  </div>
                )}

                {/* Timeline */}
                {designSuggestion.estimatedTimeline && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center">
                      <ClockIcon className="h-5 w-5 mr-2 text-blue-500" />
                      Estimated Timeline
                    </h2>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{designSuggestion.estimatedTimeline.designDays}</p>
                        <p className="text-sm text-gray-500">Design Days</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{designSuggestion.estimatedTimeline.materialProcurementDays}</p>
                        <p className="text-sm text-gray-500">Procurement Days</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{designSuggestion.estimatedTimeline.installationDays}</p>
                        <p className="text-sm text-gray-500">Installation Days</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Designer Images */}
                {designSuggestion.designImages && designSuggestion.designImages.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center">
                      <PhotoIcon className="h-5 w-5 mr-2 text-blue-500" />
                      Design Visuals
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {designSuggestion.designImages.map((image, index) => (
                        <div 
                          key={index}
                          className="cursor-pointer group relative"
                          onClick={() => setSelectedImage(image.imageUrl)}
                        >
                          <img 
                            src={image.imageUrl} 
                            alt={`Design ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Create Quotation Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleCreateQuotation}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 flex items-center shadow-lg"
                  >
                    <CurrencyRupeeIcon className="h-5 w-5 mr-2" />
                    Create Quotation Based on This Design
                  </button>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No design suggestions yet</p>
                <p className="text-sm text-gray-500">
                  The designer hasn't submitted any suggestions for this project yet.
                </p>
                <button
                  onClick={handleCreateQuotation}
                  className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Create Quotation Without Design
                </button>
              </div>
            )}
          </div>
        )}
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

export default ProjectDetailsView;