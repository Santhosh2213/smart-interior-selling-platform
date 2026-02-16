import React from 'react';
import Modal from '../common/Modal';
import { XMarkIcon, MagnifyingGlassPlusIcon, MagnifyingGlassMinusIcon } from '@heroicons/react/24/outline';

const ImageViewModal = ({ isOpen, onClose, image, annotations = [] }) => {
  const [zoom, setZoom] = React.useState(1);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="View Image" size="xl">
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={handleZoomOut}
            className="p-2 text-gray-600 hover:text-primary-600 rounded-lg hover:bg-gray-100"
          >
            <MagnifyingGlassMinusIcon className="h-5 w-5" />
          </button>
          <button
            onClick={handleZoomIn}
            className="p-2 text-gray-600 hover:text-primary-600 rounded-lg hover:bg-gray-100"
          >
            <MagnifyingGlassPlusIcon className="h-5 w-5" />
          </button>
          <span className="text-sm text-gray-600 self-center">{Math.round(zoom * 100)}%</span>
        </div>

        {/* Image Container */}
        <div className="relative overflow-auto max-h-[70vh] border rounded-lg bg-gray-50">
          <div style={{ transform: `scale(${zoom})`, transformOrigin: '0 0' }}>
            <img src={image} alt="View" className="max-w-full" />
            
            {/* Annotations */}
            {annotations.map((area, index) => (
              <div
                key={index}
                className="absolute border-2 border-primary-500 bg-primary-100 bg-opacity-30"
                style={{
                  left: area.x,
                  top: area.y,
                  width: area.width,
                  height: area.height
                }}
              >
                <span className="absolute top-0 left-0 bg-primary-600 text-white text-xs px-1">
                  Area {index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Annotations List */}
        {annotations.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Marked Areas</h4>
            <div className="space-y-2">
              {annotations.map((area, index) => (
                <div key={index} className="text-sm text-gray-600">
                  Area {index + 1}: {Math.round(area.width * 100 / image.width)}% × {Math.round(area.height * 100 / image.height)}% of image
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ImageViewModal;