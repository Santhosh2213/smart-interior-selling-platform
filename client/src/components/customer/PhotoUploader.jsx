import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  PhotoIcon, 
  XMarkIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ExclamationCircleIcon 
} from '@heroicons/react/24/outline';
import { imageService } from '../../services/imageService';
import Loader from '../common/Loader';
import toast from 'react-hot-toast';

const PhotoUploader = ({ projectId, onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(file => {
        file.errors.forEach(error => {
          if (error.code === 'file-too-large') {
            toast.error(`${file.file.name} is too large. Max size is 5MB`);
          } else if (error.code === 'file-invalid-type') {
            toast.error(`${file.file.name} is not a valid image file`);
          }
        });
      });
    }

    // Create previews for accepted files
    const newPreviews = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));

    setPreviews(prev => [...prev, ...newPreviews]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: true
  });

  const removePreview = (id) => {
    setPreviews(prev => {
      const filtered = prev.filter(p => p.id !== id);
      // Revoke object URL to free memory
      const removed = prev.find(p => p.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.preview);
      }
      return filtered;
    });
  };

  const handleUpload = async () => {
    if (previews.length === 0) {
      toast.error('Please select images to upload');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      previews.forEach(preview => {
        formData.append('images', preview.file);
      });

      const response = await imageService.uploadImages(projectId, formData);
      
      // Clean up previews
      previews.forEach(preview => {
        URL.revokeObjectURL(preview.preview);
      });

      setUploadedFiles(response.data);
      setPreviews([]);
      
      toast.success(`${response.data.length} images uploaded successfully`);
      
      if (onUploadComplete) {
        onUploadComplete(response.data);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const clearAll = () => {
    previews.forEach(preview => {
      URL.revokeObjectURL(preview.preview);
    });
    setPreviews([]);
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }`}
      >
        <input {...getInputProps()} />
        <PhotoIcon className={`h-12 w-12 mx-auto mb-3 ${isDragActive ? 'text-primary-500' : 'text-gray-400'}`} />
        
        {isDragActive ? (
          <p className="text-primary-600">Drop the images here...</p>
        ) : (
          <>
            <p className="text-gray-600 mb-1">
              Drag & drop images here, or click to select
            </p>
            <p className="text-sm text-gray-500">
              Supported formats: JPG, PNG, GIF, WEBP (Max 5MB each)
            </p>
          </>
        )}
      </div>

      {/* Preview Grid */}
      {previews.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-900">
              Selected Images ({previews.length})
            </h3>
            <button
              onClick={clearAll}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Clear all
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {previews.map((preview) => (
              <div key={preview.id} className="relative group">
                <img
                  src={preview.preview}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />
                <button
                  onClick={() => removePreview(preview.id)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
                <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                  {(preview.file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            ))}
          </div>

          {/* Upload Button */}
          <div className="flex justify-end">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="btn-primary flex items-center disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader size="sm" />
                  <span className="ml-2">Uploading...</span>
                </>
              ) : (
                <>
                  <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                  Upload {previews.length} {previews.length === 1 ? 'Image' : 'Images'}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Uploaded Files Summary */}
      {uploadedFiles.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center text-green-800 mb-2">
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            <span className="font-medium">Upload Complete!</span>
          </div>
          <p className="text-sm text-green-700">
            {uploadedFiles.length} {uploadedFiles.length === 1 ? 'image' : 'images'} uploaded successfully
          </p>
        </div>
      )}
    </div>
  );
};

export default PhotoUploader;