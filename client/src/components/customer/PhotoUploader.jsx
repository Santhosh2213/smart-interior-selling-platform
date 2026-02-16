import React, { useState, useCallback } from 'react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';

const PhotoUploader = ({ onUpload, maxFiles = 5, existingImages = [] }) => {
  const [images, setImages] = useState(existingImages);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (images.length + acceptedFiles.length > maxFiles) {
      toast.error(`You can only upload up to ${maxFiles} images`);
      return;
    }

    setUploading(true);
    
    for (const file of acceptedFiles) {
      // Create preview
      const preview = URL.createObjectURL(file);
      const newImage = {
        file,
        preview,
        uploading: true,
        annotations: []
      };
      
      setImages(prev => [...prev, newImage]);
      
      // Upload to server
      try {
        const formData = new FormData();
        formData.append('image', file);
        
        // TODO: Call API to upload image
        // const response = await api.post('/upload', formData);
        
        // Simulate upload
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setImages(prev => prev.map(img => 
          img.preview === preview 
            ? { ...img, uploading: false, url: 'uploaded-url' }
            : img
        ));
        
        if (onUpload) onUpload(file);
      } catch (error) {
        toast.error('Failed to upload image');
        setImages(prev => prev.filter(img => img.preview !== preview));
      }
    }
    
    setUploading(false);
  }, [images.length, maxFiles, onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: uploading
  });

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        {isDragActive ? (
          <p className="text-primary-600">Drop the files here...</p>
        ) : (
          <>
            <p className="text-gray-600 mb-1">
              Drag & drop photos here, or click to select
            </p>
            <p className="text-sm text-gray-500">
              Max {maxFiles} images, up to 5MB each
            </p>
          </>
        )}
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image.preview || image.url}
                alt={`Upload ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              
              {/* Uploading Overlay */}
              {image.uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}

              {/* Remove Button */}
              {!image.uploading && (
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}

              {/* Annotation Badge */}
              {image.annotations?.length > 0 && (
                <div className="absolute bottom-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                  {image.annotations.length} areas marked
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoUploader;