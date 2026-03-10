import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getProjectById, 
  submitProject,
  addMeasurement,
  uploadProjectImages 
} from '../../services/projectService';
import { 
  ArrowLeftIcon,
  PlusIcon,
  PhotoIcon,
  HomeIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showMeasurementForm, setShowMeasurementForm] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [measurementData, setMeasurementData] = useState({
    areaName: '',
    length: '',
    width: '',
    unit: 'feet'
  });

  useEffect(() => {
    if (id) {
      loadProject();
    } else {
      toast.error('No project ID provided');
      navigate('/customer/dashboard');
    }
  }, [id]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const response = await getProjectById(id);
      // Safely access data with optional chaining
      setProject(response?.data || null);
    } catch (error) {
      console.error('Error loading project:', error);
      toast.error('Failed to load project');
      navigate('/customer/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleMeasurementChange = (e) => {
    const { name, value } = e.target;
    setMeasurementData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddMeasurement = async (e) => {
    e.preventDefault();
    
    // Validate inputs with safe checks
    if (!measurementData.areaName?.trim()) {
      toast.error('Please enter an area name');
      return;
    }
    
    if (!measurementData.length || parseFloat(measurementData.length) <= 0) {
      toast.error('Please enter a valid length');
      return;
    }
    
    if (!measurementData.width || parseFloat(measurementData.width) <= 0) {
      toast.error('Please enter a valid width');
      return;
    }

    setSubmitting(true);
    try {
      const measurementPayload = {
        areaName: measurementData.areaName.trim(),
        length: parseFloat(measurementData.length),
        width: parseFloat(measurementData.width),
        unit: measurementData.unit
      };
      
      await addMeasurement(id, measurementPayload);
      toast.success('Measurement added successfully');
      setMeasurementData({ areaName: '', length: '', width: '', unit: 'feet' });
      setShowMeasurementForm(false);
      loadProject(); // Reload project data
    } catch (error) {
      console.error('Error adding measurement:', error);
      toast.error(error.response?.data?.error || 'Failed to add measurement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files || []));
  };

  const handleUploadImages = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('images', file);
    });

    setSubmitting(true);
    try {
      await uploadProjectImages(id, formData);
      toast.success('Images uploaded successfully');
      setSelectedFiles([]);
      setShowImageUpload(false);
      loadProject(); // Reload project data
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitProject = async () => {
    // Safe checks with optional chaining
    const measurements = project?.measurements || [];
    const images = project?.images || [];
    
    console.log('Submitting project - Measurements:', measurements.length);
    console.log('Submitting project - Images:', images.length);
    
    if (measurements.length === 0) {
      toast.error('Please add at least one measurement');
      return;
    }
  
    if (images.length === 0) {
      toast.error('Please upload at least one photo');
      return;
    }
  
    setSubmitting(true);
    try {
      console.log('Calling submitProject with ID:', id);
      const response = await submitProject(id);
      console.log('Submit response:', response);
      
      toast.success('Project submitted for review!');
      loadProject(); // Reload to update status
    } catch (error) {
      console.error('Error submitting project:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.error || 'Failed to submit project');
    } finally {
      setSubmitting(false);
    }
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
            onClick={() => navigate('/customer/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const canEdit = project.status === 'draft';
  const canSubmit = canEdit && (project.measurements?.length || 0) > 0 && (project.images?.length || 0) > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/customer/dashboard')}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.title || 'Untitled Project'}</h1>
            <p className="text-gray-600">
              Status: <span className="capitalize">{project.status || 'draft'}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Project Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-gray-600">{project.description || 'No description provided'}</p>
            </div>

            {/* Measurements */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Measurements</h2>
                {canEdit && (
                  <button
                    onClick={() => setShowMeasurementForm(!showMeasurementForm)}
                    className="text-blue-600 hover:text-blue-700 flex items-center"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add Measurement
                  </button>
                )}
              </div>

              {showMeasurementForm && (
                <form onSubmit={handleAddMeasurement} className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="col-span-2">
                      <label className="block text-sm text-gray-600 mb-1">Area Name</label>
                      <input
                        type="text"
                        name="areaName"
                        value={measurementData.areaName}
                        onChange={handleMeasurementChange}
                        className="w-full px-3 py-2 border rounded"
                        placeholder="e.g., Living Room, Kitchen"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Length</label>
                      <input
                        type="number"
                        name="length"
                        value={measurementData.length}
                        onChange={handleMeasurementChange}
                        className="w-full px-3 py-2 border rounded"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Width</label>
                      <input
                        type="number"
                        name="width"
                        value={measurementData.width}
                        onChange={handleMeasurementChange}
                        className="w-full px-3 py-2 border rounded"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowMeasurementForm(false)}
                      className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      {submitting ? 'Adding...' : 'Add'}
                    </button>
                  </div>
                </form>
              )}

              {project.measurements && project.measurements.length > 0 ? (
                <div className="space-y-3">
                  {project.measurements.map((m, index) => (
                    <div key={m._id || index} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{m.areaName || `Area ${index + 1}`}</p>
                        <p className="text-sm text-gray-600">
                          {m.length} × {m.width} {project.measurementUnit || 'feet'}
                        </p>
                      </div>
                      <p className="text-sm font-medium">
                        {(m.areaSqFt || m.area || 0).toFixed(2)} sq.{project.measurementUnit || 'ft'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No measurements added</p>
              )}
            </div>

            {/* Photos */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Photos</h2>
                {canEdit && (
                  <button
                    onClick={() => setShowImageUpload(!showImageUpload)}
                    className="text-blue-600 hover:text-blue-700 flex items-center"
                  >
                    <PhotoIcon className="h-4 w-4 mr-1" />
                    Upload Photos
                  </button>
                )}
              </div>

              {showImageUpload && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mb-4"
                  />
                  {selectedFiles.length > 0 && (
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowImageUpload(false)}
                        className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUploadImages}
                        disabled={submitting}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        {submitting ? 'Uploading...' : `Upload ${selectedFiles.length} Images`}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {project.images && project.images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {project.images.map((image, index) => (
                    <img
                      key={image._id || index}
                      src={image.imageUrl}
                      alt={`Project ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No photos uploaded</p>
              )}
            </div>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Submit Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Ready for Review?</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center">
                  <CheckCircleIcon className={`h-5 w-5 mr-2 ${(project.measurements?.length || 0) > 0 ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className={(project.measurements?.length || 0) > 0 ? 'text-gray-700' : 'text-gray-400'}>
                    Add measurements ({project.measurements?.length || 0})
                  </span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className={`h-5 w-5 mr-2 ${(project.images?.length || 0) > 0 ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className={(project.images?.length || 0) > 0 ? 'text-gray-700' : 'text-gray-400'}>
                    Upload photos ({project.images?.length || 0})
                  </span>
                </div>
              </div>

              {project.status === 'draft' ? (
                <button
                  onClick={handleSubmitProject}
                  disabled={!canSubmit || submitting}
                  className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit for Review'}
                </button>
              ) : (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    This project has been submitted and is awaiting review.
                  </p>
                </div>
              )}
            </div>

            {/* Project Info Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Project Info</h2>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-600">Created:</span> {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}</p>
                {project.submittedAt && (
                  <p><span className="text-gray-600">Submitted:</span> {new Date(project.submittedAt).toLocaleDateString()}</p>
                )}
                <p><span className="text-gray-600">Measurement Unit:</span> {project.measurementUnit || 'feet'}</p>
                <p><span className="text-gray-600">Total Area:</span> {(project.totalArea || 0).toFixed(2)} sq.{project.measurementUnit || 'ft'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;