import { useState, useEffect } from 'react';
import { projectService } from '../services/projectService';
import toast from 'react-hot-toast';

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getCustomerProjects();
      setProjects(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData) => {
    try {
      const response = await projectService.createProject(projectData);
      setProjects([response.data, ...projects]);
      toast.success('Project created successfully');
      return response.data;
    } catch (err) {
      toast.error('Failed to create project');
      throw err;
    }
  };

  const updateProject = async (id, projectData) => {
    try {
      const response = await projectService.updateProject(id, projectData);
      setProjects(projects.map(p => p._id === id ? response.data : p));
      toast.success('Project updated successfully');
      return response.data;
    } catch (err) {
      toast.error('Failed to update project');
      throw err;
    }
  };

  const deleteProject = async (id) => {
    try {
      await projectService.deleteProject(id);
      setProjects(projects.filter(p => p._id !== id));
      toast.success('Project deleted successfully');
    } catch (err) {
      toast.error('Failed to delete project');
      throw err;
    }
  };

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refreshProjects: fetchProjects
  };
};