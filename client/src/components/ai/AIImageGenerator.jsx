import React, { useState, useRef, useCallback } from 'react';
import { 
  SparklesIcon, 
  PhotoIcon, 
  ArrowDownTrayIcon,
  XMarkIcon,
  ArrowPathIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  AdjustmentsHorizontalIcon,
  DocumentDuplicateIcon,
  PaintBrushIcon,
  HomeIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Style presets
const STYLE_PRESETS = [
  { id: 'modern', label: 'Modern Minimalist', color: '#6366f1' },
  { id: 'scandinavian', label: 'Scandinavian', color: '#0ea5e9' },
  { id: 'industrial', label: 'Industrial', color: '#78716c' },
  { id: 'bohemian', label: 'Bohemian', color: '#d97706' },
  { id: 'traditional', label: 'Traditional', color: '#16a34a' },
  { id: 'luxury', label: 'Luxury Contemporary', color: '#c026d3' },
];

const LIGHTING_OPTIONS = [
  { id: 'natural', label: 'Natural Daylight' },
  { id: 'warm', label: 'Warm Evening' },
  { id: 'cool', label: 'Cool White' },
  { id: 'dramatic', label: 'Dramatic Accent' },
];

const ROOM_TYPES = [
  { id: 'living', label: 'Living Room', emoji: '🛋️' },
  { id: 'bedroom', label: 'Bedroom', emoji: '🛏️' },
  { id: 'kitchen', label: 'Kitchen', emoji: '🍳' },
  { id: 'bathroom', label: 'Bathroom', emoji: '🚿' },
  { id: 'office', label: 'Home Office', emoji: '💼' },
  { id: 'dining', label: 'Dining Room', emoji: '🍽️' },
];

const AIImageGenerator = ({ project, onImageGenerated, onSaveToDesignImages }) => {
  const fileInputRef = useRef(null);
  const [sketchFile, setSketchFile] = useState(null);
  const [sketchPreview, setSketchPreview] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [progress, setProgress] = useState(0);
  const [generationStage, setGenerationStage] = useState('');
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('modern');
  const [selectedLighting, setSelectedLighting] = useState('natural');
  const [selectedRoom, setSelectedRoom] = useState('living');
  const [generationHistory, setGenerationHistory] = useState([]);
  const [showFullImage, setShowFullImage] = useState(false);

  // File handlers
  const handleFileSelect = useCallback((file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, or WEBP)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be under 10MB');
      return;
    }
    setSketchFile(file);
    setGeneratedImage(null);
    setGeneratedImageUrl(null);
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => setSketchPreview(reader.result);
    reader.readAsDataURL(file);
    toast.success('Sketch uploaded successfully');
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const buildPrompt = () => {
    const styleLabel = STYLE_PRESETS.find(s => s.id === selectedStyle)?.label || selectedStyle;
    const lightingLabel = LIGHTING_OPTIONS.find(l => l.id === selectedLighting)?.label || selectedLighting;
    const roomLabel = ROOM_TYPES.find(r => r.id === selectedRoom)?.label || selectedRoom;

    let finalPrompt = `Create a photorealistic interior design image for a ${roomLabel}.

Design requirements:
- Style: ${styleLabel}
- Lighting: ${lightingLabel}
- Room type: ${roomLabel}

${prompt || 'Create a beautiful interior design'}

Generate a high-quality, professional interior design visualization.`;

    return finalPrompt;
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && !sketchFile) {
      toast.error('Please enter a prompt or upload a sketch');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setProgress(10);
    setGenerationStage('Preparing request...');
    setGeneratedImage(null);
    setGeneratedImageUrl(null);

    try {
      let imageBase64 = null;
      if (sketchFile) {
        setProgress(20);
        setGenerationStage('Processing sketch...');
        imageBase64 = await fileToBase64(sketchFile);
      }

      setProgress(40);
      setGenerationStage('Calling AI service...');

      const serverUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${serverUrl}/designer/ai/generate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          prompt: buildPrompt(),
          imageBase64: imageBase64,
          mediaType: sketchFile?.type || 'image/jpeg',
          roomType: selectedRoom,
          style: selectedStyle,
          lighting: selectedLighting,
          model: 'img4',
          n: 1,
          size: '1024x1024',
          response_format: 'url'
        }),
      });

      setProgress(70);
      setGenerationStage('Generating image...');

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      if (data.success) {
        setProgress(100);
        setGenerationStage('Complete!');
        
        // Extract image URL from response
        let imageUrl = null;
        if (data.data?.images?.[0]?.url) {
          imageUrl = data.data.images[0].url;
        } else if (data.data?.url) {
          imageUrl = data.data.url;
        } else if (data.imageUrl) {
          imageUrl = data.imageUrl;
        }
        
        if (imageUrl) {
          console.log('Generated image URL:', imageUrl);
          setGeneratedImageUrl(imageUrl);
          setGeneratedImage(imageUrl);
          
          if (onImageGenerated) {
            onImageGenerated(imageUrl);
          }
          
          toast.success('Image generated successfully!');
          
          // Save to history
          setGenerationHistory(prev => [
            {
              id: Date.now(),
              sketchPreview: sketchPreview,
              prompt: prompt,
              imageUrl: imageUrl,
              timestamp: new Date().toLocaleTimeString()
            },
            ...prev.slice(0, 4)
          ]);
        } else {
          throw new Error('No image URL in response');
        }
      } else {
        throw new Error(data.error || 'Generation failed');
      }

    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message || 'Generation failed. Please try again.');
      toast.error('Generation failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsGenerating(false);
      setTimeout(() => {
        setProgress(0);
        setGenerationStage('');
      }, 1500);
    }
  };

  const handleDownload = () => {
    if (generatedImageUrl) {
      const link = document.createElement('a');
      link.href = generatedImageUrl;
      link.download = `ai-design-${Date.now()}.png`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Image downloaded');
    }
  };

  const handleSaveToDesign = () => {
    if (generatedImageUrl && onSaveToDesignImages) {
      onSaveToDesignImages(generatedImageUrl);
      toast.success('Image saved to design images!');
    }
  };

  const resetUpload = () => {
    setSketchFile(null);
    setSketchPreview(null);
    setGeneratedImage(null);
    setGeneratedImageUrl(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-5 text-white">
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-white/20 rounded-lg p-2">
            <SparklesIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">AI Image Generator</h2>
            <p className="text-green-100 text-sm">
              Generate professional interior design images using AI
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Upload & Config */}
        <div className="space-y-5">

          {/* Sketch Upload (Optional) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <PaintBrushIcon className="h-4 w-4 text-green-600" />
              Upload Reference Sketch (Optional)
            </h3>

            {sketchPreview ? (
              <div className="relative group rounded-lg overflow-hidden border-2 border-green-200">
                <img src={sketchPreview} alt="Sketch" className="w-full max-h-40 object-contain bg-gray-50" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white text-gray-800 px-3 py-1.5 rounded-lg text-xs font-medium shadow"
                  >
                    Change
                  </button>
                  <button
                    onClick={resetUpload}
                    className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow"
                  >
                    Remove
                  </button>
                </div>
                <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                  Reference loaded
                </div>
              </div>
            ) : (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
                }`}
              >
                <CloudArrowUpIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600">Drag & drop a reference sketch (optional)</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP (max 10MB)</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files[0])}
            />
          </div>

          {/* Room Type */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <HomeIcon className="h-4 w-4 text-green-600" />
              Room Type
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {ROOM_TYPES.map(room => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                    selectedRoom === room.id
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
                  }`}
                >
                  <span className="mr-1">{room.emoji}</span>{room.label}
                </button>
              ))}
            </div>
          </div>

          {/* Design Style */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Design Style</h3>
            <div className="grid grid-cols-2 gap-2">
              {STYLE_PRESETS.map(style => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                    selectedStyle === style.id
                      ? 'border-2 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={selectedStyle === style.id ? { borderColor: style.color } : {}}
                >
                  <span
                    className="h-3 w-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: style.color }}
                  />
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Options */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full text-sm font-semibold text-gray-700"
            >
              <span className="flex items-center gap-2">
                <AdjustmentsHorizontalIcon className="h-4 w-4 text-green-600" />
                Advanced Parameters
              </span>
              <span className="text-xs text-gray-400">{showAdvanced ? 'Hide' : 'Show'}</span>
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Lighting</label>
                  <div className="flex flex-wrap gap-2">
                    {LIGHTING_OPTIONS.map(l => (
                      <button
                        key={l.id}
                        onClick={() => setSelectedLighting(l.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          selectedLighting === l.id
                            ? 'bg-amber-50 border-amber-400 text-amber-700'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-amber-300'
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Prompt */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <LightBulbIcon className="h-4 w-4 text-green-600" />
              Design Description *
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder="Describe the design you want: modern furniture, specific colors, lighting preferences, etc."
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              required
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className={`w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
              isGenerating || !prompt.trim()
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-200 active:scale-[0.98]'
            }`}
          >
            {isGenerating ? (
              <>
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                {generationStage || 'Generating...'} {progress}%
              </>
            ) : (
              <>
                <SparklesIcon className="h-4 w-4" />
                Generate AI Image
              </>
            )}
          </button>

          {/* Progress bar */}
          {isGenerating && (
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>{generationStage}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-700">Generation Failed</p>
                <p className="text-xs text-red-500 mt-0.5">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Results */}
        <div className="space-y-5">
          {!generatedImageUrl && !isGenerating && (
            <div className="bg-white rounded-xl shadow-sm border border-dashed border-gray-200 p-12 text-center h-full flex flex-col items-center justify-center">
              <div className="bg-green-50 rounded-2xl p-5 mb-4">
                <PhotoIcon className="h-12 w-12 text-green-300 mx-auto" />
              </div>
              <p className="text-sm font-medium text-gray-500">Your AI-generated image will appear here</p>
              <p className="text-xs text-gray-400 mt-1">Enter a prompt and click Generate</p>
            </div>
          )}

          {generatedImageUrl && (
            <div className="space-y-4">
              {/* Generated Image */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SparklesIcon className="h-5 w-5 text-white" />
                      <h4 className="font-semibold text-white">Generated Image</h4>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowFullImage(true)}
                        className="bg-white/20 hover:bg-white/30 rounded-lg p-1.5 transition-colors"
                        title="View Full Size"
                      >
                        <EyeIcon className="h-4 w-4 text-white" />
                      </button>
                      <button
                        onClick={handleDownload}
                        className="bg-white/20 hover:bg-white/30 rounded-lg p-1.5 transition-colors"
                        title="Download"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 text-white" />
                      </button>
                      {onSaveToDesignImages && (
                        <button
                          onClick={handleSaveToDesign}
                          className="bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                        >
                          Save to Design
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <img
                    src={generatedImageUrl}
                    alt="AI Generated Design"
                    className="w-full rounded-lg shadow-md cursor-pointer hover:opacity-95 transition-opacity"
                    onClick={() => setShowFullImage(true)}
                    onError={(e) => {
                      console.error('Image failed to load:', generatedImageUrl);
                      e.target.src = 'https://via.placeholder.com/1024x1024?text=Image+Load+Failed';
                    }}
                  />
                </div>
              </div>

              {/* Generation Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500">
                  <span className="font-medium">Prompt:</span> {prompt.substring(0, 100)}...
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  <span className="font-medium">Style:</span> {STYLE_PRESETS.find(s => s.id === selectedStyle)?.label}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  <span className="font-medium">Room:</span> {ROOM_TYPES.find(r => r.id === selectedRoom)?.label}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex-1 bg-green-600 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  Regenerate
                </button>
                <button
                  onClick={resetUpload}
                  className="p-2.5 border border-gray-200 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-red-400 transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Generation History */}
      {generationHistory.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <DocumentDuplicateIcon className="h-4 w-4 text-green-600" />
            Recent Generations
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {generationHistory.map(item => (
              <div
                key={item.id}
                className="flex-shrink-0 w-36 border border-gray-100 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  setGeneratedImageUrl(item.imageUrl);
                  setGeneratedImage(item.imageUrl);
                  setPrompt(item.prompt);
                  if (item.sketchPreview) setSketchPreview(item.sketchPreview);
                }}
              >
                <img src={item.imageUrl} alt="History" className="w-full h-24 object-cover bg-gray-50" />
                <div className="p-2">
                  <p className="text-xs text-gray-400 truncate">{item.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Screen Image Modal */}
      {showFullImage && generatedImageUrl && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setShowFullImage(false)}
        >
          <div className="max-w-5xl max-h-[90vh] relative">
            <img 
              src={generatedImageUrl} 
              alt="Full size" 
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setShowFullImage(false)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <button
              onClick={handleDownload}
              className="absolute bottom-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-colors"
            >
              <ArrowDownTrayIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIImageGenerator;