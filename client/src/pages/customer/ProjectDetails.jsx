import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { 
  ArrowLeftIcon, 
  PlusIcon, 
  PhotoIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddMeasurement, setShowAddMeasurement] = useState(false);
  const [measurementData, setMeasurementData] = useState({
    areaName: '',
    length: '',
    width: '',
    unit: 'feet'
  });

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await projectService.getProjectById(id);
      setProject(response.data);
    } catch (error) {
      toast.error('Failed to fetch project details');
      navigate('/customer/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleMeasurementChange = (e) => {
    setMeasurementData({
      ...measurementData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddMeasurement = async (e) => {
    e.preventDefault();
    
    try {
      const response = await projectService.addMeasurement(id, measurementData);
      toast.success('Measurement added successfully');
      setShowAddMeasurement(false);
      setMeasurementData({
        areaName: '',
        length: '',
        width: '',
        unit: project.measurementUnit || 'feet'
      });
      fetchProject(); // Refresh project data
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add measurement');
    }
  };

  const handleSubmitProject = async () => {
    try {
      await projectService.submitProject(id);
      toast.success('Project submitted for quotation');
      fetchProject();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit project');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'quoted': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateTotalArea = () => {
    if (!project?.measurements) return 0;
    return project.measurements.reduce((sum, m) => {
      return sum + (m.unit === 'feet' ? m.areaSqFt : m.areaSqM);
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Project not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/customer/dashboard')}
            className="mr-4 text-gray-600 hover:text-primary-600"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
            <p className="text-gray-600">Created on {new Date(project.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(project.status)}`}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </span>
          
          {project.status === 'draft' && (
            <>
              <Link
                to={`/customer/projects/${id}/edit`}
                className="btn-secondary flex items-center"
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Edit
              </Link>
              <button
                onClick={handleSubmitProject}
                disabled={project.measurements?.length === 0}
                className="btn-primary flex items-center disabled:opacity-50"
              >
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                Submit for Quote
              </button>
            </>
          )}

          {project.status === 'quoted' && (
            <Link
              to={`/customer/quotation/${project.quotations?.[0]?._id}`}
              className="btn-primary flex items-center"
            >
              <DocumentTextIcon className="h-4 w-4 mr-1" />
              View Quotation
            </Link>
          )}
        </div>
      </div>

      {/* Project Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Description */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Description</h2>
          <p className="text-gray-600">
            {project.description || 'No description provided'}
          </p>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Project Stats</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Measurement Unit:</span>
              <span className="font-medium capitalize">{project.measurementUnit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Areas Measured:</span>
              <span className="font-medium">{project.measurements?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Area:</span>
              <span className="font-medium">
                {calculateTotalArea().toFixed(2)} {project.measurementUnit === 'feet' ? 'sq ft' : 'sq m'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Photos:</span>
              <span className="font-medium">{project.images?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Measurements Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Area Measurements</h2>
          {project.status === 'draft' && (
            <button
              onClick={() => setShowAddMeasurement(true)}
              className="btn-primary flex items-center text-sm"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Measurement
            </button>
          )}
        </div>

        {/* Add Measurement Form */}
        {showAddMeasurement && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-4">Add New Area</h3>
            <form onSubmit={handleAddMeasurement} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Area Name
                  </label>
                  <input
                    type="text"
                    name="areaName"
                    required
                    value={measurementData.areaName}
                    onChange={handleMeasurementChange}
                    className="input-field"
                    placeholder="e.g., Living Room, Kitchen Wall"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <select
                    name="unit"
                    value={measurementData.unit}
                    onChange={handleMeasurementChange}
                    className="input-field"
                  >
                    <option value="feet">Feet (ft)</option>
                    <option value="meter">Meters (m)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Length
                  </label>
                  <input
                    type="number"
                    name="length"
                    required
                    step="0.01"
                    min="0.01"
                    value={measurementData.length}
                    onChange={handleMeasurementChange}
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Width
                  </label>
                  <input
                    type="number"
                    name="width"
                    required
                    step="0.01"
                    min="0.01"
                    value={measurementData.width}
                    onChange={handleMeasurementChange}
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddMeasurement(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Add Area
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Measurements List */}
        {project.measurements && project.measurements.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Area Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dimensions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Area (sq ft)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Area (sq m)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {project.measurements.map((measurement) => (
                  <tr key={measurement._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {measurement.areaName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {measurement.length} × {measurement.width} {measurement.unit}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {measurement.areaSqFt?.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {measurement.areaSqM?.toFixed(2)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No measurements added yet</p>
            {project.status === 'draft' && (
              <button
                onClick={() => setShowAddMeasurement(true)}
                className="btn-primary inline-flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Your First Measurement
              </button>
            )}
          </div>
        )}
      </div>

      {/* Photos Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Photos</h2>
          {project.status === 'draft' && (
            <button className="btn-primary flex items-center text-sm">
              <PhotoIcon className="h-4 w-4 mr-1" />
              Upload Photos
            </button>
          )}
        </div>

        {project.images && project.images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {project.images.map((image) => (
              <div key={image._id} className="relative group">
                <img
                  src={image.imageUrl}
                  alt="Project"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No photos uploaded yet</p>
            {project.status === 'draft' && (
              <p className="text-sm text-gray-400 mt-2">
                Upload photos to help sellers provide accurate quotations
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;