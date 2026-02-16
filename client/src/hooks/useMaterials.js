import { useState, useEffect } from 'react';
import { materialService } from '../services/materialService';
import toast from 'react-hot-toast';

export const useMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await materialService.getAllMaterials();
      setMaterials(response.data);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(response.data.map(m => m.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      toast.error('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const addMaterial = async (materialData) => {
    try {
      const response = await materialService.createMaterial(materialData);
      setMaterials([response.data, ...materials]);
      toast.success('Material added successfully');
      return response.data;
    } catch (error) {
      toast.error('Failed to add material');
      throw error;
    }
  };

  const updateMaterial = async (id, materialData) => {
    try {
      const response = await materialService.updateMaterial(id, materialData);
      setMaterials(materials.map(m => m._id === id ? response.data : m));
      toast.success('Material updated successfully');
      return response.data;
    } catch (error) {
      toast.error('Failed to update material');
      throw error;
    }
  };

  const deleteMaterial = async (id) => {
    try {
      await materialService.deleteMaterial(id);
      setMaterials(materials.filter(m => m._id !== id));
      toast.success('Material deleted successfully');
    } catch (error) {
      toast.error('Failed to delete material');
      throw error;
    }
  };

  const getMaterialsByCategory = (category) => {
    return materials.filter(m => m.category === category);
  };

  return {
    materials,
    loading,
    categories,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    getMaterialsByCategory,
    refreshMaterials: fetchMaterials
  };
};