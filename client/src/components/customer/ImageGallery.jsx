import React, { useState, useEffect } from 'react';
import { 
  StarIcon as StarIconOutline,
  TrashIcon,
  MagnifyingGlassPlusIcon,
  PhotoIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { imageService } from '../../services/imageService';
import Loader from '../common/Loader';
import toast from 'react-hot-toast';

const ImageGallery = ({ projectId, onImageChange }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchImages();
  }, [projectId]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await imageService.getProjectImages(projectId);
      setImages(response.data || []);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      await imageService.deleteImage(imageId);
      setImages(prev => prev.filter(img => img._id !== imageId));
      toast.success('Image deleted successfully');
      if (onImageChange) onImageChange();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.error || 'Failed to delete image');
    }
  };

  const handleSetMain = async (imageId) => {
    try {
      await imageService.setMainImage(imageId);
      setImages(prev => prev.map(img => ({
        ...img,
        isMain: img._id === imageId
      })));
      toast.success('Main image updated');
      if (onImageChange) onImageChange();
    } catch (error) {
      console.error('Set main error:', error);
      toast.error(error.response?.data?.error || 'Failed to set main image');
    }
  };

  const openImageViewer = (image) => {
    setSelectedImage(image);
    setShowModal(true);
  };

  const closeImageViewer = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader size="md" />
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">No images uploaded yet</p>
        <p className="text-sm text-gray-400 mt-1">
          Upload photos to help sellers provide accurate quotations
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((image) => (
          <div key={image._id} className="relative group">
            <img
              src={image.imageUrl}
              alt="Project"
              className="w-full h-32 object-cover rounded-lg cursor-pointer border border-gray-200 hover:opacity-90 transition-opacity"
              onClick={() => openImageViewer(image)}
            />
            
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button
                onClick={() => openImageViewer(image)}
                className="p-1 bg-white rounded-full mx-1 hover:bg-gray-100 transition-colors"
                title="View"
              >
                <MagnifyingGlassPlusIcon className="h-5 w-5 text-gray-700" />
              </button>
              
              {!image.isMain && (
                <button
                  onClick={() => handleSetMain(image._id)}
                  className="p-1 bg-white rounded-full mx-1 hover:bg-gray-100 transition-colors"
                  title="Set as main"
                >
                  <StarIconOutline className="h-5 w-5 text-yellow-500" />
                </button>
              )}
              
              <button
                onClick={() => handleDelete(image._id)}
                className="p-1 bg-white rounded-full mx-1 hover:bg-gray-100 transition-colors"
                title="Delete"
              >
                <TrashIcon className="h-5 w-5 text-red-500" />
              </button>
            </div>

            {/* Main image badge */}
            {image.isMain && (
              <div className="absolute top-1 left-1 bg-yellow-500 text-white rounded-full p-1">
                <StarIconSolid className="h-4 w-4" />
              </div>
            )}

            {/* Date badge */}
            <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
              {new Date(image.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {/* Image Viewer Modal */}
      {showModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <button
            onClick={closeImageViewer}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            title="Close"
          >
            <XMarkIcon className="h-8 w-8" />
          </button>
          
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage.imageUrl}
              alt="Project"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg text-sm">
              <p>Uploaded: {new Date(selectedImage.createdAt).toLocaleString()}</p>
              {selectedImage.isMain && <p className="text-yellow-400 font-medium">★ Main Image</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;