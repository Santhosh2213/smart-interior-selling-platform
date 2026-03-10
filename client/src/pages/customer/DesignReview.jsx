import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectDetails, respondToDesign } from '../../services/customerService';
import Loader from '../../components/common/Loader';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  PencilIcon,
  ArrowLeftIcon 
} from '@heroicons/react/24/outline';

const DesignReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [responseNotes, setResponseNotes] = useState('');

  useEffect(() => {
    loadDesignData();
  }, [id]);

  const loadDesignData = async () => {
    try {
      const data = await getProjectDetails(id);
      setProject(data.project);
      setSuggestion(data.designSuggestion);
    } catch (error) {
      console.error('Error loading design:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (response) => {
    setSubmitting(true);
    try {
      await respondToDesign(id, {
        response,
        notes: responseNotes
      });
      
      if (response === 'APPROVED') {
        navigate('/customer/dashboard', { 
          state: { message: 'Design approved! Seller will contact you soon.' }
        });
      } else if (response === 'CHANGES_REQUESTED') {
        alert('Change request sent to designer');
        loadDesignData(); // Reload to show updated status
      } else if (response === 'REJECTED') {
        navigate('/customer/dashboard', {
          state: { message: 'Design rejected. You can request a new designer.' }
        });
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;
  if (!suggestion) return <div>No design suggestion found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/customer/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Design Review - {project?.title}</h1>
          
          {/* Design Status */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Status:</p>
            <p className="text-lg font-semibold capitalize">
              {suggestion.customerResponse === 'PENDING' ? 'Awaiting Your Review' : suggestion.customerResponse}
            </p>
          </div>

          {/* Design Details */}
          <div className="space-y-6">
            {/* Theme */}
            {suggestion.suggestedTheme && (
              <div>
                <h3 className="font-semibold mb-2">Suggested Theme</h3>
                <p className="text-gray-700">{suggestion.suggestedTheme}</p>
              </div>
            )}

            {/* Color Scheme */}
            {suggestion.colorScheme && Object.values(suggestion.colorScheme).some(c => c) && (
              <div>
                <h3 className="font-semibold mb-2">Color Scheme</h3>
                <div className="flex space-x-4">
                  {suggestion.colorScheme.primary && (
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full" style={{ backgroundColor: suggestion.colorScheme.primary }} />
                      <span className="text-xs">Primary</span>
                    </div>
                  )}
                  {suggestion.colorScheme.secondary && (
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full" style={{ backgroundColor: suggestion.colorScheme.secondary }} />
                      <span className="text-xs">Secondary</span>
                    </div>
                  )}
                  {suggestion.colorScheme.accent && (
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full" style={{ backgroundColor: suggestion.colorScheme.accent }} />
                      <span className="text-xs">Accent</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Material Recommendations */}
            {suggestion.recommendations?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Material Recommendations</h3>
                <div className="space-y-3">
                  {suggestion.recommendations.map((rec, idx) => (
                    <div key={idx} className="border rounded p-3">
                      <p className="font-medium">{rec.materialId?.name}</p>
                      <p className="text-sm text-gray-600">
                        Quantity: {rec.quantity} {rec.unit}
                      </p>
                      {rec.notes && <p className="text-sm text-gray-500 mt-1">{rec.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Design Notes */}
            {suggestion.designNotes && (
              <div>
                <h3 className="font-semibold mb-2">Design Notes</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{suggestion.designNotes}</p>
              </div>
            )}

            {/* Timeline */}
            {suggestion.estimatedTimeline && (
              <div>
                <h3 className="font-semibold mb-2">Estimated Timeline</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">Design</p>
                    <p className="text-lg font-semibold">{suggestion.estimatedTimeline.designDays} days</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">Procurement</p>
                    <p className="text-lg font-semibold">{suggestion.estimatedTimeline.materialProcurementDays} days</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">Installation</p>
                    <p className="text-lg font-semibold">{suggestion.estimatedTimeline.installationDays} days</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Response Form (only if pending) */}
          {suggestion.customerResponse === 'PENDING' && (
            <div className="mt-8 border-t pt-6">
              <h3 className="font-semibold mb-4">Your Response</h3>
              
              <textarea
                value={responseNotes}
                onChange={(e) => setResponseNotes(e.target.value)}
                placeholder="Add any comments or change requests..."
                className="w-full border rounded-lg p-3 h-24 mb-4"
              />

              <div className="flex space-x-4">
                <button
                  onClick={() => handleResponse('APPROVED')}
                  disabled={submitting}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                >
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Approve Design
                </button>
                
                <button
                  onClick={() => handleResponse('CHANGES_REQUESTED')}
                  disabled={submitting}
                  className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center justify-center"
                >
                  <PencilIcon className="h-5 w-5 mr-2" />
                  Request Changes
                </button>
                
                <button
                  onClick={() => handleResponse('REJECTED')}
                  disabled={submitting}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
                >
                  <XCircleIcon className="h-5 w-5 mr-2" />
                  Reject Design
                </button>
              </div>
            </div>
          )}

          {/* Response Summary (if already responded) */}
          {suggestion.customerResponse !== 'PENDING' && (
            <div className="mt-8 border-t pt-6">
              <h3 className="font-semibold mb-2">Your Response</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium capitalize">Status: {suggestion.customerResponse}</p>
                {suggestion.customerResponseNotes && (
                  <p className="text-gray-600 mt-2">{suggestion.customerResponseNotes}</p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Responded on: {new Date(suggestion.customerResponseAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignReview;