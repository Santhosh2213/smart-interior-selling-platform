import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProject } from '../../services/projectService';
import { PhotoIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const CreateProject = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    measurementUnit: 'feet'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter a project title');
      return;
    }

    setLoading(true);
    try {
      const response = await createProject(formData);
      toast.success('Project created successfully');
      navigate(`/customer/projects/${response.data._id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error(error.response?.data?.error || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Project</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Bedroom Renovation, Kitchen Design"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Describe your project requirements..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Measurement Unit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Measurement Unit
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="measurementUnit"
                    value="feet"
                    checked={formData.measurementUnit === 'feet'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Feet
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="measurementUnit"
                    value="meter"
                    checked={formData.measurementUnit === 'meter'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Meters
                </label>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex">
                <PhotoIcon className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm text-blue-800">
                    After creating the project, you'll be able to add:
                  </p>
                  <ul className="text-sm text-blue-700 mt-2 list-disc list-inside">
                    <li>Room measurements with dimensions</li>
                    <li>Photos of the space</li>
                    <li>Mark areas on photos</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/customer/dashboard')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;