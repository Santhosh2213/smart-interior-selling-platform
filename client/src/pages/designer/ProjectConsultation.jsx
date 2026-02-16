import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { designerService } from '../../services/designerService';
import { materialService } from '../../services/materialService';
import SuggestionForm from '../../components/designer/SuggestionForm';
import MaterialRecommendation from '../../components/designer/MaterialRecommendation';
import { 
  ArrowLeftIcon,
  PhotoIcon,
  DocumentTextIcon,
  ChatBubbleLeftIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const ProjectConsultation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [activeTab, setActiveTab] = useState('details');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [projectRes, materialsRes] = await Promise.all([
        designerService.getProjectById(id),
        materialService.getAllMaterials()
      ]);
      
      setProject(projectRes.data);
      setMaterials(materialsRes.data);
    } catch (error) {
      toast.error('Failed to load project data');
      navigate('/designer/consultations');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSuggestions = async (suggestionData) => {
    try {
      await designerService.addSuggestions(id, suggestionData);
      toast.success('Suggestions saved successfully');
      setActiveTab('details');
      fetchData();
    } catch (error) {
      toast.error('Failed to save suggestions');
    }
  };

  const handleRecommendMaterials = async (recommendationData) => {
    try {
      await designerService.recommendMaterials(id, recommendationData);
      toast.success('Material recommendations sent');
      setActiveTab('details');
    } catch (error) {
      toast.error('Failed to send recommendations');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  const tabs = [
    { id: 'details', name: 'Project Details', icon: DocumentTextIcon },
    { id: 'photos', name: 'Photos', icon: PhotoIcon },
    { id: 'suggestions', name: 'Add Suggestions', icon: LightBulbIcon },
    { id: 'materials', name: 'Recommend Materials', icon: ChatBubbleLeftIcon }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/designer/consultations')}
          className="mr-4 text-gray-600 hover:text-primary-600"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Consultation</h1>
          <p className="text-gray-600">{project?.title}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === 'details' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Project Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-medium">{project?.customerId?.userId?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="font-medium">{new Date(project?.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Measurement Unit</p>
                  <p className="font-medium capitalize">{project?.measurementUnit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Area</p>
                  <p className="font-medium">
                    {project?.totalArea?.toFixed(2)} {project?.measurementUnit === 'feet' ? 'sq ft' : 'sq m'}
                  </p>
                </div>
              </div>
            </div>

            {project?.description && (
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-gray-600">{project.description}</p>
              </div>
            )}

            <div>
              <h3 className="font-medium mb-2">Measurements</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Area</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Dimensions</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Area (sq ft)</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Area (sq m)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {project?.measurements?.map((measurement) => (
                      <tr key={measurement._id}>
                        <td className="px-4 py-2 text-sm">{measurement.areaName}</td>
                        <td className="px-4 py-2 text-sm">
                          {measurement.length} × {measurement.width} {measurement.unit}
                        </td>
                        <td className="px-4 py-2 text-sm">{measurement.areaSqFt?.toFixed(2)}</td>
                        <td className="px-4 py-2 text-sm">{measurement.areaSqM?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'photos' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Project Photos</h2>
            {project?.images && project.images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {project.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.imageUrl}
                      alt={`Project ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    {image.annotations && image.annotations.length > 0 && (
                      <div className="absolute bottom-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                        {image.annotations.length} areas marked
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No photos uploaded</p>
            )}
          </div>
        )}

        {activeTab === 'suggestions' && (
          <SuggestionForm project={project} onSave={handleSaveSuggestions} />
        )}

        {activeTab === 'materials' && (
          <MaterialRecommendation
            materials={materials}
            onRecommend={handleRecommendMaterials}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectConsultation;