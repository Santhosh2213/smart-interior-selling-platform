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
  PaintBrushIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  CheckCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const ApprovedDesignView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState('design');

  useEffect(() => {
    if (id) {
      loadProjectData();
    }
  }, [id]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      const response = await getProjectById(id);
      console.log('Project response:', response); // Debug log
      
      const projectData = response.data || response;
      setProject(projectData);
      
      // Get the design suggestion - check different possible paths
      if (projectData.designSuggestionId) {
        console.log('Design suggestion found:', projectData.designSuggestionId);
        setDesign(projectData.designSuggestionId);
      } else {
        console.log('No design suggestion found in project data');
      }
    } catch (error) {
      console.error('Error loading project:', error);
      toast.error('Failed to load project details');
      navigate('/seller/queue');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuotation = () => {
    navigate(`/seller/quotations/create/${id}`, { 
      state: { designSuggestion: design } 
    });
  };

  const calculateTotalCost = () => {
    if (!design?.recommendations) return 0;
    return design.recommendations.reduce((sum, rec) => sum + (rec.estimatedCost || 0), 0);
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

  const totalCost = calculateTotalCost();

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
            {design && (
              <div className="flex items-center space-x-3">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Design Approved by Customer
                </span>
                <button
                  onClick={handleCreateQuotation}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <CurrencyRupeeIcon className="h-5 w-5 mr-2" />
                  Create Quotation
                </button>
              </div>
            )}
          </div>
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Project ID: {project._id} • {design ? `Version ${design.version || 1}` : 'No design yet'}
            </p>
          </div>
        </div>
      </div>

      {/* Only show tabs and content if design exists */}
      {design ? (
        <>
          {/* Tabs */}
          <div className="border-b border-gray-200 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('design')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'design'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Design Recommendations
                </button>
                <button
                  onClick={() => setActiveTab('images')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === 'images'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <PhotoIcon className="h-4 w-4 mr-1" />
                  Design Images ({design.designImages?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('project')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'project'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Project Details
                </button>
              </nav>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {activeTab === 'project' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                        <div key={index} className="border-b last:border-0 pb-2">
                          <p className="font-medium">{m.areaName || `Area ${index + 1}`}</p>
                          <p className="text-sm text-gray-600">
                            {m.length} × {m.width} {project.measurementUnit || 'feet'}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No measurements</p>
                  )}
                </div>

                {/* Customer Photos */}
                {project.images && project.images.length > 0 && (
                  <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center">
                      <PhotoIcon className="h-5 w-5 mr-2 text-blue-500" />
                      Customer Photos ({project.images.length})
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                            <EyeIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'design' && (
              <div className="space-y-6">
                {/* Design Summary Card */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold mb-1">Design Summary</h2>
                      <p className="text-sm text-blue-100">Version {design.version || 1} • Approved by customer</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">Total Estimated Cost</p>
                      <p className="text-3xl font-bold">₹{totalCost.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Theme & Color Scheme */}
                {(design.suggestedTheme || (design.colorScheme && Object.values(design.colorScheme).some(c => c))) && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center">
                      <PaintBrushIcon className="h-5 w-5 mr-2 text-blue-500" />
                      Theme & Color Scheme
                    </h2>
                    {design.suggestedTheme && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Suggested Theme</p>
                        <p className="font-medium">{design.suggestedTheme}</p>
                      </div>
                    )}
                    {design.colorScheme && (
                      <div className="flex space-x-6">
                        {design.colorScheme.primary && (
                          <div>
                            <div className="w-12 h-12 rounded-full mb-1" style={{ backgroundColor: design.colorScheme.primary }} />
                            <p className="text-xs text-gray-500">Primary</p>
                          </div>
                        )}
                        {design.colorScheme.secondary && (
                          <div>
                            <div className="w-12 h-12 rounded-full mb-1" style={{ backgroundColor: design.colorScheme.secondary }} />
                            <p className="text-xs text-gray-500">Secondary</p>
                          </div>
                        )}
                        {design.colorScheme.accent && (
                          <div>
                            <div className="w-12 h-12 rounded-full mb-1" style={{ backgroundColor: design.colorScheme.accent }} />
                            <p className="text-xs text-gray-500">Accent</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Material Recommendations */}
                {design.recommendations && design.recommendations.length > 0 ? (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center">
                      <CubeIcon className="h-5 w-5 mr-2 text-blue-500" />
                      Material Recommendations
                    </h2>
                    <div className="space-y-4">
                      {design.recommendations.map((rec, index) => {
                        const material = rec.materialId;
                        return (
                          <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="font-medium text-gray-900">
                                  {material?.name || rec.materialName || 'Material'}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                  Quantity: {rec.quantity} {rec.unit}
                                </p>
                                {rec.notes && (
                                  <p className="text-sm text-gray-500 mt-1 italic">"{rec.notes}"</p>
                                )}
                                {material && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    ₹{material.pricePerUnit || 0}/{material.unit || rec.unit}
                                  </p>
                                )}
                              </div>
                              <div className="text-right ml-4">
                                <span className="font-semibold text-blue-600 text-lg">
                                  ₹{(rec.estimatedCost || 0).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow p-12 text-center">
                    <CubeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No material recommendations</p>
                  </div>
                )}

                {/* Design Notes */}
                {design.designNotes && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center">
                      <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-500" />
                      Designer's Notes
                    </h2>
                    <p className="text-gray-700 whitespace-pre-wrap">{design.designNotes}</p>
                  </div>
                )}

                {/* Timeline */}
                {design.estimatedTimeline && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center">
                      <ClockIcon className="h-5 w-5 mr-2 text-blue-500" />
                      Estimated Timeline
                    </h2>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">{design.estimatedTimeline.designDays}</p>
                        <p className="text-sm text-gray-500">Design Days</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">{design.estimatedTimeline.materialProcurementDays}</p>
                        <p className="text-sm text-gray-500">Procurement</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">{design.estimatedTimeline.installationDays}</p>
                        <p className="text-sm text-gray-500">Installation</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'images' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <PhotoIcon className="h-5 w-5 mr-2 text-blue-500" />
                  Designer's Visuals
                </h2>
                {design.designImages && design.designImages.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {design.designImages.map((image, index) => (
                      <div 
                        key={index}
                        className="relative cursor-pointer group aspect-square"
                        onClick={() => setSelectedImage(image.imageUrl)}
                      >
                        <img 
                          src={image.imageUrl} 
                          alt={`Design ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg flex items-center justify-center">
                          <EyeIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100" />
                        </div>
                        {image.description && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b-lg">
                            {image.description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <PhotoIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No design images uploaded</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        // Show this if no design exists
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Design Available</h2>
            <p className="text-gray-600 mb-6">
              This project doesn't have an approved design yet. 
              The designer needs to submit a design and the customer needs to approve it.
            </p>
            <Link
              to={`/seller/project/${id}`}
              className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              <EyeIcon className="h-5 w-5 mr-2" />
              View Project Details
            </Link>
          </div>
        </div>
      )}

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

export default ApprovedDesignView;