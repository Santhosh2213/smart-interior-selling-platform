import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await projectService.createProject(formData);
      toast.success('Project created successfully!');
      navigate(`/customer/projects/${response.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Back Button */}
      <button
        onClick={() => navigate('/customer/dashboard')}
        className="flex items-center text-gray-600 hover:text-primary-600 mb-6"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        Back to Dashboard
      </button>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Project</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Project Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., Kitchen Renovation, Bedroom Flooring"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              className="input-field"
              placeholder="Describe your project requirements, preferences, etc."
            />
          </div>

          {/* Measurement Unit */}
          <div>
            <label htmlFor="measurementUnit" className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Measurement Unit <span className="text-red-500">*</span>
            </label>
            <select
              id="measurementUnit"
              name="measurementUnit"
              required
              value={formData.measurementUnit}
              onChange={handleChange}
              className="input-field"
            >
              <option value="feet">Feet (ft)</option>
              <option value="meter">Meters (m)</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              You can change this later for individual measurements
            </p>
          </div>

          {/* Next Steps Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Next Steps:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Add area measurements (length × width)</li>
              <li>• Upload wall/area photos</li>
              <li>• Select materials from our database</li>
              <li>• Submit for quotation</li>
            </ul>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/customer/dashboard')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;