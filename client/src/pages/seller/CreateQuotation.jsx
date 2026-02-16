import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sellerService } from '../../services/sellerService';
import { materialService } from '../../services/materialService';
import QuoteBuilder from '../../components/seller/QuoteBuilder';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const CreateQuotation = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      const [projectRes, materialsRes] = await Promise.all([
        sellerService.getProjectById(projectId),
        materialService.getAllMaterials()
      ]);
      
      setProject(projectRes.data);
      setMaterials(materialsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
      navigate('/seller/project-queue');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuotation = async (quotationData) => {
    try {
      await sellerService.createQuotation(quotationData);
      toast.success('Quotation created successfully');
      navigate('/seller/quotations');
    } catch (error) {
      toast.error('Failed to create quotation');
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
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/seller/project-queue')}
          className="mr-4 text-gray-600 hover:text-primary-600"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Quotation</h1>
          <p className="text-gray-600">Project: {project?.title}</p>
        </div>
      </div>

      {/* Project Summary */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Project Summary</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Customer</p>
            <p className="font-medium">{project?.customerId?.userId?.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Area</p>
            <p className="font-medium">
              {project?.totalArea?.toFixed(2)} {project?.measurementUnit === 'feet' ? 'sq ft' : 'sq m'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Measurements</p>
            <p className="font-medium">{project?.measurements?.length} areas</p>
          </div>
        </div>

        {project?.description && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">Description</p>
            <p className="text-gray-900">{project.description}</p>
          </div>
        )}
      </div>

      {/* Quote Builder */}
      <QuoteBuilder
        project={project}
        materials={materials}
        onSave={handleSaveQuotation}
      />
    </div>
  );
};

export default CreateQuotation;