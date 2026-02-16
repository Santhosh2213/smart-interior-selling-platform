import React, { useState, useRef, useEffect } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

const AreaMarker = ({ image, onMarkArea, onDeleteArea, existingAreas = [] }) => {
  const [areas, setAreas] = useState(existingAreas);
  const [drawing, setDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [currentRect, setCurrentRect] = useState(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    drawCanvas();
  }, [areas, currentRect, image]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    if (!img || !ctx) return;

    // Set canvas dimensions to match image
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw image
    ctx.drawImage(img, 0, 0, img.width, img.height);

    // Draw existing areas
    areas.forEach((area, index) => {
      ctx.strokeStyle = '#0ea5e9';
      ctx.lineWidth = 3;
      ctx.strokeRect(area.x, area.y, area.width, area.height);

      // Add area number
      ctx.fillStyle = '#0ea5e9';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(index + 1, area.x + 5, area.y + 25);
    });

    // Draw current rectangle while drawing
    if (currentRect) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.strokeRect(currentRect.x, currentRect.y, currentRect.width, currentRect.height);
    }
  };

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvasRef.current.width / rect.width);
    const y = (e.clientY - rect.top) * (canvasRef.current.height / rect.height);

    setDrawing(true);
    setStartPoint({ x, y });
    setCurrentRect({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e) => {
    if (!drawing || !startPoint) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvasRef.current.width / rect.width);
    const y = (e.clientY - rect.top) * (canvasRef.current.height / rect.height);

    setCurrentRect({
      x: Math.min(startPoint.x, x),
      y: Math.min(startPoint.y, y),
      width: Math.abs(x - startPoint.x),
      height: Math.abs(y - startPoint.y)
    });
  };

  const handleMouseUp = () => {
    if (!drawing || !currentRect || currentRect.width < 10 || currentRect.height < 10) {
      setDrawing(false);
      setCurrentRect(null);
      return;
    }

    // Add new area
    const newArea = {
      ...currentRect,
      id: Date.now()
    };

    setAreas([...areas, newArea]);
    if (onMarkArea) onMarkArea(newArea);
    
    setDrawing(false);
    setCurrentRect(null);
  };

  const handleDeleteArea = (index) => {
    const newAreas = areas.filter((_, i) => i !== index);
    setAreas(newAreas);
    if (onDeleteArea) onDeleteArea(index);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <img
          ref={imageRef}
          src={image}
          alt="Mark area"
          className="max-w-full hidden"
          onLoad={drawCanvas}
        />
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => setDrawing(false)}
          className="max-w-full border rounded-lg cursor-crosshair"
        />
      </div>

      {/* Areas List */}
      {areas.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Marked Areas</h4>
          <div className="space-y-2">
            {areas.map((area, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div>
                  <span className="font-medium">Area {index + 1}</span>
                  <p className="text-sm text-gray-600">
                    {Math.round(area.width * (100/imageRef.current?.width))}% × {Math.round(area.height * (100/imageRef.current?.height))}% of image
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteArea(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AreaMarker;