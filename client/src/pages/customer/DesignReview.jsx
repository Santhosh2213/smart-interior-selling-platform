import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getProjectDesign,
  respondToDesign,
  requestDesignChanges 
} from '../../services/customerService';
import Loader from '../../components/common/Loader';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  PencilIcon,
  ArrowLeftIcon,
  PhotoIcon,
  HomeIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  PaintBrushIcon,
  DocumentTextIcon,
  CubeIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const DesignReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showChangeForm, setShowChangeForm] = useState(false);
  const [changeRequest, setChangeRequest] = useState({
    type: 'design_change',
    description: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      loadDesignData();
    } else {
      setError('No project ID provided');
      setLoading(false);
    }
  }, [id]);

  const loadDesignData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading design for project:', id);
      const data = await getProjectDesign(id);
      console.log('Design data received:', data);
      setProject(data.project);
      setDesign(data.design);
    } catch (error) {
      console.error('Error loading design:', error);
      setError(error.response?.data?.error || 'Failed to load design');
      toast.error('Failed to load design');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!window.confirm('Are you sure you want to approve this design?')) return;
    
    setSubmitting(true);
    try {
      await respondToDesign(id, {
        response: 'APPROVED',
        notes: ''
      });
      toast.success('Design approved! Seller will be notified.');
      navigate('/customer/dashboard');
    } catch (error) {
      console.error('Error approving design:', error);
      toast.error('Failed to approve design');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!window.confirm('Are you sure you want to reject this design?')) return;
    
    setSubmitting(true);
    try {
      await respondToDesign(id, {
        response: 'REJECTED',
        notes: ''
      });
      toast.success('Design rejected');
      navigate('/customer/dashboard');
    } catch (error) {
      console.error('Error rejecting design:', error);
      toast.error('Failed to reject design');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestChanges = async (e) => {
    e.preventDefault();
    if (!changeRequest.description.trim()) {
      toast.error('Please describe the changes you want');
      return;
    }
    
    setSubmitting(true);
    try {
      await requestDesignChanges(id, changeRequest);
      toast.success('Change request sent to designer');
      setShowChangeForm(false);
      loadDesignData(); // Reload to show updated status
    } catch (error) {
      console.error('Error requesting changes:', error);
      toast.error('Failed to send change request');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateTotalCost = () => {
    return design?.recommendations?.reduce((sum, r) => sum + (r.estimatedCost || 0), 0) || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader />
          <p className="mt-4 text-gray-600">Loading design details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 text-red-700 p-6 rounded-lg max-w-md">
            <h2 className="text-xl font-bold mb-2">Error Loading Design</h2>
            <p className="mb-4">{error}</p>
            <button
              onClick={() => navigate('/customer/dashboard')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!design) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No design found for this project</p>
          <button
            onClick={() => navigate('/customer/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Dashboard
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
            onClick={() => navigate('/customer/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Dashboard
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{project?.title}</h1>
              <p className="text-sm text-gray-500 mt-1">Design Review</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                design.customerResponse === 'APPROVED' ? 'bg-green-100 text-green-800' :
                design.customerResponse === 'REJECTED' ? 'bg-red-100 text-red-800' :
                design.customerResponse === 'CHANGES_REQUESTED' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {design.customerResponse === 'PENDING' ? 'AWAITING REVIEW' : design.customerResponse}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Design Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Designer Images */}
            {design.designImages && design.designImages.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <PhotoIcon className="h-5 w-5 mr-2 text-blue-500" />
                  Design Visuals
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                        }}
                      />
                      {image.description && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg">
                          {image.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Theme & Color Scheme */}
            {(design.suggestedTheme || design.colorScheme) && (
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
            {design.recommendations && design.recommendations.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <CubeIcon className="h-5 w-5 mr-2 text-blue-500" />
                  Material Recommendations
                </h2>
                <div className="space-y-4">
                  {design.recommendations.map((rec, index) => {
                    const material = rec.materialId;
                    return (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-gray-900">
                            {material?.name || 'Material'} 
                            <span className="text-sm text-gray-500 ml-2">x {rec.quantity} {rec.unit}</span>
                          </h3>
                          {rec.estimatedCost > 0 && (
                            <span className="font-semibold text-blue-600">
                              ₹{rec.estimatedCost.toLocaleString()}
                            </span>
                          )}
                        </div>
                        {rec.notes && (
                          <p className="text-sm text-gray-600 mt-1">{rec.notes}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Design Notes */}
            {design.designNotes && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-500" />
                  Design Notes
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
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{design.estimatedTimeline.designDays}</p>
                    <p className="text-sm text-gray-500">Design Days</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{design.estimatedTimeline.materialProcurementDays}</p>
                    <p className="text-sm text-gray-500">Procurement Days</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{design.estimatedTimeline.installationDays}</p>
                    <p className="text-sm text-gray-500">Installation Days</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Actions & Summary */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-blue-500" />
                Your Details
              </h2>
              <div className="space-y-2">
                <p className="flex items-center">
                  <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="font-medium">{project?.customerName}</span>
                </p>
                {project?.customerEmail && (
                  <p className="flex items-center">
                    <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span>{project.customerEmail}</span>
                  </p>
                )}
                {project?.customerPhone && (
                  <p className="flex items-center">
                    <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span>{project.customerPhone}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Cost Summary */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
              <h2 className="text-lg font-semibold mb-2 flex items-center">
                <CurrencyRupeeIcon className="h-5 w-5 mr-2" />
                Total Estimated Cost
              </h2>
              <p className="text-3xl font-bold">₹{totalCost.toLocaleString()}</p>
              <p className="text-sm text-blue-100 mt-2">Version {design.version}</p>
            </div>

            {/* Change History */}
            {design.changeRequests && design.changeRequests.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold mb-3">Change History</h3>
                <div className="space-y-3">
                  {design.changeRequests.map((req, index) => (
                    <div key={index} className="text-sm border-l-2 border-yellow-400 pl-3">
                      <p className="text-gray-800">{req.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(req.createdAt).toLocaleDateString()} • {req.status}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons - Only show if pending */}
            {design.customerResponse === 'PENDING' && (
              <div className="bg-white rounded-lg shadow p-6 space-y-4">
                {!showChangeForm ? (
                  <>
                    <button
                      onClick={handleApprove}
                      disabled={submitting}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                    >
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      Approve Design
                    </button>
                    
                    <button
                      onClick={() => setShowChangeForm(true)}
                      disabled={submitting}
                      className="w-full bg-yellow-600 text-white py-3 px-4 rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center justify-center"
                    >
                      <PencilIcon className="h-5 w-5 mr-2" />
                      Request Changes
                    </button>
                    
                    <button
                      onClick={handleReject}
                      disabled={submitting}
                      className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
                    >
                      <XCircleIcon className="h-5 w-5 mr-2" />
                      Reject Design
                    </button>
                  </>
                ) : (
                  <form onSubmit={handleRequestChanges} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Describe the changes you want
                      </label>
                      <textarea
                        value={changeRequest.description}
                        onChange={(e) => setChangeRequest({...changeRequest, description: e.target.value})}
                        className="w-full border rounded-lg p-3 h-32"
                        placeholder="Please describe what changes you'd like to see..."
                        required
                      />
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowChangeForm(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                      >
                        Send Request
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Response Summary */}
            {design.customerResponse !== 'PENDING' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold mb-2">Your Response</h3>
                <div className={`p-4 rounded-lg ${
                  design.customerResponse === 'APPROVED' ? 'bg-green-50' :
                  design.customerResponse === 'REJECTED' ? 'bg-red-50' :
                  'bg-yellow-50'
                }`}>
                  <p className="font-medium capitalize mb-2">{design.customerResponse}</p>
                  {design.customerResponseNotes && (
                    <p className="text-sm text-gray-600">{design.customerResponseNotes}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(design.customerResponseAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
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
              <span className="text-2xl">&times;</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignReview;