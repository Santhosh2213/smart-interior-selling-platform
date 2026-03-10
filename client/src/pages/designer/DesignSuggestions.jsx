import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getSuggestionHistory,
  getProjectForDesign 
} from '../../services/designerService';
import Loader from '../../components/common/Loader';
import { 
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon 
} from '@heroicons/react/24/outline';

const DesignSuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filter, setFilter] = useState('all'); // all, submitted, approved, rejected
  const navigate = useNavigate();

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      const data = await getSuggestionHistory();
      setSuggestions(data);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (suggestion) => {
    try {
      const projectData = await getProjectForDesign(suggestion.projectId._id);
      setSelectedSuggestion({
        ...suggestion,
        projectDetails: projectData.project
      });
      setShowDetails(true);
    } catch (error) {
      console.error('Error loading suggestion details:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'APPROVED':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'REJECTED':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSuggestions = suggestions.filter(s => {
    if (filter === 'all') return true;
    return s.status.toLowerCase() === filter.toLowerCase();
  });

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/designer/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Design Suggestions History</h1>
          <p className="text-gray-600">View all your past design recommendations</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-6 flex space-x-2">
          {['all', 'submitted', 'approved', 'rejected'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Suggestions List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredSuggestions.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredSuggestions.map((suggestion) => (
                <div key={suggestion._id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        {getStatusIcon(suggestion.status)}
                        <h3 className="text-lg font-medium text-gray-900 ml-2">
                          {suggestion.projectId?.title || 'Project'}
                        </h3>
                        <span className={`ml-3 px-2 py-1 text-xs rounded-full ${getStatusColor(suggestion.status)}`}>
                          {suggestion.status}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-2">
                        Submitted: {new Date(suggestion.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>

                      {suggestion.designNotes && (
                        <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                          {suggestion.designNotes}
                        </p>
                      )}

                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-gray-500">
                          Materials: {suggestion.recommendations?.length || 0}
                        </span>
                        {suggestion.suggestedTheme && (
                          <span className="text-gray-500">
                            Theme: {suggestion.suggestedTheme}
                          </span>
                        )}
                        <span className="text-gray-500">
                          Version: {suggestion.version || 1}
                        </span>
                      </div>

                      {suggestion.recommendations && suggestion.recommendations.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Materials:</p>
                          <div className="flex flex-wrap gap-2">
                            {suggestion.recommendations.slice(0, 3).map((rec, idx) => (
                              <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {rec.materialId?.name || 'Material'} ({rec.quantity} {rec.unit})
                              </span>
                            ))}
                            {suggestion.recommendations.length > 3 && (
                              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                +{suggestion.recommendations.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleViewDetails(suggestion)}
                      className="ml-4 p-2 text-gray-400 hover:text-gray-600"
                      title="View Details"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-gray-500">No suggestions found</p>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && selectedSuggestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">Design Suggestion Details</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Project Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Project Information</h3>
                <p><span className="text-gray-600">Title:</span> {selectedSuggestion.projectDetails?.title}</p>
                <p><span className="text-gray-600">Customer:</span> {selectedSuggestion.projectDetails?.customerId?.name}</p>
                <p><span className="text-gray-600">Submitted:</span> {new Date(selectedSuggestion.createdAt).toLocaleString()}</p>
                <p><span className="text-gray-600">Status:</span> 
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(selectedSuggestion.status)}`}>
                    {selectedSuggestion.status}
                  </span>
                </p>
              </div>

              {/* Theme & Colors */}
              {(selectedSuggestion.suggestedTheme || selectedSuggestion.colorScheme?.primary) && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Theme & Color Scheme</h3>
                  {selectedSuggestion.suggestedTheme && (
                    <p><span className="text-gray-600">Theme:</span> {selectedSuggestion.suggestedTheme}</p>
                  )}
                  {selectedSuggestion.colorScheme?.primary && (
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center">
                        <div 
                          className="w-6 h-6 rounded-full mr-2" 
                          style={{ backgroundColor: selectedSuggestion.colorScheme.primary }}
                        />
                        <span className="text-sm">Primary</span>
                      </div>
                      {selectedSuggestion.colorScheme.secondary && (
                        <div className="flex items-center">
                          <div 
                            className="w-6 h-6 rounded-full mr-2" 
                            style={{ backgroundColor: selectedSuggestion.colorScheme.secondary }}
                          />
                          <span className="text-sm">Secondary</span>
                        </div>
                      )}
                      {selectedSuggestion.colorScheme.accent && (
                        <div className="flex items-center">
                          <div 
                            className="w-6 h-6 rounded-full mr-2" 
                            style={{ backgroundColor: selectedSuggestion.colorScheme.accent }}
                          />
                          <span className="text-sm">Accent</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Design Notes */}
              {selectedSuggestion.designNotes && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Design Notes</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedSuggestion.designNotes}</p>
                </div>
              )}

              {/* Material Recommendations */}
              {selectedSuggestion.recommendations && selectedSuggestion.recommendations.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Material Recommendations</h3>
                  <div className="space-y-3">
                    {selectedSuggestion.recommendations.map((rec, idx) => (
                      <div key={idx} className="border rounded p-3">
                        <p className="font-medium">{rec.materialId?.name || 'Material'}</p>
                        <p className="text-sm text-gray-600">
                          Quantity: {rec.quantity} {rec.unit}
                        </p>
                        {rec.notes && (
                          <p className="text-sm text-gray-500 mt-1">{rec.notes}</p>
                        )}
                        {rec.estimatedCost > 0 && (
                          <p className="text-sm font-medium text-blue-600 mt-1">
                            Estimated: ₹{rec.estimatedCost.toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline */}
              {selectedSuggestion.estimatedTimeline && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Estimated Timeline</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-600">Design</p>
                      <p className="text-lg font-semibold">{selectedSuggestion.estimatedTimeline.designDays} days</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-600">Procurement</p>
                      <p className="text-lg font-semibold">{selectedSuggestion.estimatedTimeline.materialProcurementDays} days</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-600">Installation</p>
                      <p className="text-lg font-semibold">{selectedSuggestion.estimatedTimeline.installationDays} days</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignSuggestions;