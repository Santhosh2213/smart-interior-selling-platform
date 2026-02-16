import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { designerService } from '../../services/designerService';
import { 
  ArrowLeftIcon,
  LightBulbIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const DesignSuggestions = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [editingSuggestion, setEditingSuggestion] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    materials: [],
    estimatedCost: ''
  });

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      const [projectRes, suggestionsRes] = await Promise.all([
        designerService.getProjectById(projectId),
        designerService.getSuggestions(projectId)
      ]);
      
      setProject(projectRes.data);
      setSuggestions(suggestionsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (suggestion) => {
    setEditingSuggestion(suggestion._id);
    setEditForm({
      title: suggestion.title,
      description: suggestion.description,
      materials: suggestion.materials || [],
      estimatedCost: suggestion.estimatedCost || ''
    });
  };

  const handleCancel = () => {
    setEditingSuggestion(null);
    setEditForm({
      title: '',
      description: '',
      materials: [],
      estimatedCost: ''
    });
  };

  const handleSave = async (id) => {
    try {
      await designerService.updateSuggestion(id, editForm);
      toast.success('Suggestion updated');
      setEditingSuggestion(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to update suggestion');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this suggestion?')) {
      return;
    }

    try {
      await designerService.deleteSuggestion(id);
      toast.success('Suggestion deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete suggestion');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await designerService.updateSuggestionStatus(id, status);
      toast.success(`Suggestion ${status}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/designer/dashboard')}
          className="mr-4 text-gray-600 hover:text-primary-600"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Design Suggestions</h1>
          <p className="text-gray-600">Project: {project?.title}</p>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="space-y-6">
        {suggestions.map((suggestion) => (
          <div key={suggestion._id} className="bg-white rounded-lg shadow p-6">
            {editingSuggestion === suggestion._id ? (
              // Edit Mode
              <div className="space-y-4">
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className="input-field"
                  placeholder="Suggestion Title"
                />
                
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  rows="4"
                  className="input-field"
                  placeholder="Description"
                />
                
                <input
                  type="text"
                  value={editForm.materials.join(', ')}
                  onChange={(e) => setEditForm({
                    ...editForm, 
                    materials: e.target.value.split(',').map(m => m.trim()).filter(m => m)
                  })}
                  className="input-field"
                  placeholder="Materials (comma separated)"
                />
                
                <input
                  type="number"
                  value={editForm.estimatedCost}
                  onChange={(e) => setEditForm({...editForm, estimatedCost: e.target.value})}
                  className="input-field"
                  placeholder="Estimated Cost"
                />
                
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={handleCancel}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSave(suggestion._id)}
                    className="btn-primary"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <LightBulbIcon className="h-5 w-5 text-primary-600 mr-2" />
                    <h3 className="text-lg font-semibold">{suggestion.title}</h3>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      suggestion.status === 'approved' ? 'bg-green-100 text-green-800' :
                      suggestion.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {suggestion.status || 'pending'}
                    </span>
                    
                    <button
                      onClick={() => handleEdit(suggestion)}
                      className="text-gray-400 hover:text-primary-600"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(suggestion._id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{suggestion.description}</p>

                {suggestion.materials?.length > 0 && (
                  <div className="mb-3">
                    <span className="text-sm text-gray-500">Materials: </span>
                    <span className="text-sm">{suggestion.materials.join(', ')}</span>
                  </div>
                )}

                {suggestion.estimatedCost && (
                  <div className="mb-4">
                    <span className="text-sm text-gray-500">Estimated Cost: </span>
                    <span className="text-sm font-medium">₹{suggestion.estimatedCost}</span>
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <button
                    onClick={() => handleStatusChange(suggestion._id, 'approved')}
                    className="text-green-600 hover:text-green-700 flex items-center text-sm"
                  >
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusChange(suggestion._id, 'rejected')}
                    className="text-red-600 hover:text-red-700 flex items-center text-sm"
                  >
                    <XCircleIcon className="h-4 w-4 mr-1" />
                    Reject
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {suggestions.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <LightBulbIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No suggestions yet</h3>
            <p className="text-gray-600 mb-6">Add your first design suggestion for this project.</p>
            <button
              onClick={() => navigate(`/designer/project/${projectId}`)}
              className="btn-primary"
            >
              Add Suggestion
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignSuggestions;