import React, { useState } from 'react';
import { LightBulbIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

const SuggestionForm = ({ project, onSave }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [currentSuggestion, setCurrentSuggestion] = useState({
    title: '',
    description: '',
    materials: [],
    estimatedCost: ''
  });

  const addSuggestion = () => {
    if (currentSuggestion.title && currentSuggestion.description) {
      setSuggestions([...suggestions, { ...currentSuggestion, id: Date.now() }]);
      setCurrentSuggestion({
        title: '',
        description: '',
        materials: [],
        estimatedCost: ''
      });
    }
  };

  const removeSuggestion = (id) => {
    setSuggestions(suggestions.filter(s => s.id !== id));
  };

  const handleSubmit = () => {
    onSave({
      projectId: project._id,
      suggestions
    });
  };

  return (
    <div className="space-y-6">
      {/* Add Suggestion Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <LightBulbIcon className="h-5 w-5 mr-2 text-primary-600" />
          Add Design Suggestion
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Suggestion Title
            </label>
            <input
              type="text"
              value={currentSuggestion.title}
              onChange={(e) => setCurrentSuggestion({...currentSuggestion, title: e.target.value})}
              className="input-field"
              placeholder="e.g., Modern Kitchen Layout, Space Optimization"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={currentSuggestion.description}
              onChange={(e) => setCurrentSuggestion({...currentSuggestion, description: e.target.value})}
              rows="4"
              className="input-field"
              placeholder="Describe your design suggestion in detail..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recommended Materials (comma separated)
            </label>
            <input
              type="text"
              value={currentSuggestion.materials.join(', ')}
              onChange={(e) => setCurrentSuggestion({
                ...currentSuggestion, 
                materials: e.target.value.split(',').map(m => m.trim()).filter(m => m)
              })}
              className="input-field"
              placeholder="e.g., Premium Tiles, Teak Wood, Tempered Glass"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Cost (₹)
            </label>
            <input
              type="number"
              value={currentSuggestion.estimatedCost}
              onChange={(e) => setCurrentSuggestion({...currentSuggestion, estimatedCost: e.target.value})}
              className="input-field"
              placeholder="50000"
            />
          </div>

          <button
            onClick={addSuggestion}
            className="btn-secondary flex items-center"
            disabled={!currentSuggestion.title || !currentSuggestion.description}
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Suggestion
          </button>
        </div>
      </div>

      {/* Suggestions List */}
      {suggestions.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Your Suggestions</h3>
          
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="border rounded-lg p-4 relative">
                <button
                  onClick={() => removeSuggestion(suggestion.id)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-600"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
                
                <h4 className="font-medium text-gray-900 mb-2">{suggestion.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                
                {suggestion.materials.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs text-gray-500">Materials: </span>
                    <span className="text-sm">{suggestion.materials.join(', ')}</span>
                  </div>
                )}
                
                {suggestion.estimatedCost && (
                  <div className="text-sm">
                    <span className="text-gray-500">Estimated Cost: </span>
                    <span className="font-medium">₹{suggestion.estimatedCost}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button onClick={handleSubmit} className="btn-primary">
              Submit Suggestions
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuggestionForm;