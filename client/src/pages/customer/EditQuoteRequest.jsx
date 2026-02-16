import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { quotationService } from '../../services/quotationService';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const EditQuoteRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [formData, setFormData] = useState({
    requirements: '',
    budget: '',
    timeline: '',
    additionalNotes: ''
  });

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await projectService.getProjectById(id);
      setProject(response.data);
    } catch (error) {
      toast.error('Failed to fetch project');
      navigate('/customer/dashboard');
    } finally {
      setLoading(false);
    }
  };

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
      await quotationService.requestQuote(id, formData);
      toast.success('Quote request updated successfully');
      navigate(`/customer/projects/${id}`);
    } catch (error) {
      toast.error('Failed to update quote request');
    } finally {
      setLoading(false);
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
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <button
        onClick={() => navigate(`/customer/projects/${id}`)}
        className="flex items-center text-gray-600 hover:text-primary-600 mb-6"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        Back to Project
      </button>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Quote Request</h1>
        <p className="text-gray-600 mb-6">Project: {project?.title}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Requirements
            </label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              rows="4"
              className="input-field"
              placeholder="Describe your requirements in detail..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Budget Range (₹)
            </label>
            <input
              type="text"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., 50000 - 100000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Timeline
            </label>
            <input
              type="text"
              name="timeline"
              value={formData.timeline}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., Within 2 weeks"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={handleChange}
              rows="3"
              className="input-field"
              placeholder="Any other requirements or preferences..."
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/customer/projects/${id}`)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Updating...' : 'Update Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditQuoteRequest;