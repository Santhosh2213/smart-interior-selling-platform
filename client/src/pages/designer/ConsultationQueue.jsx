import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDesignerQueue } from '../../services/designerService'; // Named import
// OR if you prefer default import:
// import designerService from '../../services/designerService';
import ConsultationCard from '../../components/designer/ConsultationCard';
import Loader from '../../components/common/Loader';

const ConsultationQueue = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    try {
      const data = await getDesignerQueue(); // Using named import
      setProjects(data);
    } catch (error) {
      console.error('Failed to load queue:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Consultation Queue</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <ConsultationCard
            key={project._id}
            project={project}
            onClick={() => navigate(`/designer/consultation/${project._id}`)}
          />
        ))}
        
        {projects.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No projects awaiting consultation
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultationQueue;