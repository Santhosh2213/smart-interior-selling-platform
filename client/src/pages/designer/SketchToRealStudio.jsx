// import React, { useState, useRef, useCallback } from 'react';
// import {
//   PhotoIcon,
//   SparklesIcon,
//   ArrowDownTrayIcon,
//   XMarkIcon,
//   ArrowPathIcon,
//   PaintBrushIcon,
//   HomeIcon,
//   CloudArrowUpIcon,
//   CheckCircleIcon,
//   ExclamationTriangleIcon,
//   LightBulbIcon,
//   AdjustmentsHorizontalIcon,
//   DocumentDuplicateIcon
// } from '@heroicons/react/24/outline';
// import toast from 'react-hot-toast';

// // ─── Style presets ────────────────────────────────────────────────────────────
// const ROOM_TYPES = [
//   { id: 'living', label: 'Living Room', emoji: '🛋️' },
//   { id: 'bedroom', label: 'Bedroom', emoji: '🛏️' },
//   { id: 'kitchen', label: 'Kitchen', emoji: '🍳' },
//   { id: 'bathroom', label: 'Bathroom', emoji: '🚿' },
//   { id: 'office', label: 'Home Office', emoji: '💼' },
//   { id: 'dining', label: 'Dining Room', emoji: '🍽️' },
// ];

// const STYLE_PRESETS = [
//   { id: 'modern', label: 'Modern Minimalist', color: '#6366f1' },
//   { id: 'scandinavian', label: 'Scandinavian', color: '#0ea5e9' },
//   { id: 'industrial', label: 'Industrial', color: '#78716c' },
//   { id: 'bohemian', label: 'Bohemian', color: '#d97706' },
//   { id: 'traditional', label: 'Traditional', color: '#16a34a' },
//   { id: 'luxury', label: 'Luxury Contemporary', color: '#c026d3' },
// ];

// const LIGHTING_OPTIONS = [
//   { id: 'natural', label: 'Natural Daylight' },
//   { id: 'warm', label: 'Warm Evening' },
//   { id: 'cool', label: 'Cool White' },
//   { id: 'dramatic', label: 'Dramatic Accent' },
// ];

// // ─── Main Component ───────────────────────────────────────────────────────────
// const SketchToRealStudio = ({ project, onSaveToDesign }) => {
//   const fileInputRef = useRef(null);
//   const [sketchFile, setSketchFile] = useState(null);
//   const [sketchPreview, setSketchPreview] = useState(null);
//   const [generatedImage, setGeneratedImage] = useState(null);
//   const [generationDescription, setGenerationDescription] = useState('');
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [isDragging, setIsDragging] = useState(false);
//   const [error, setError] = useState(null);
//   const [generationProgress, setGenerationProgress] = useState(0);
//   const [generationStage, setGenerationStage] = useState('');
//   const [savedToDesign, setSavedToDesign] = useState(false);
//   const [generationHistory, setGenerationHistory] = useState([]);

//   // Form state
//   const [selectedRoom, setSelectedRoom] = useState('living');
//   const [selectedStyle, setSelectedStyle] = useState('modern');
//   const [selectedLighting, setSelectedLighting] = useState('natural');
//   const [customRequirements, setCustomRequirements] = useState('');
//   const [materialPreference, setMaterialPreference] = useState('');
//   const [colorPalette, setColorPalette] = useState('neutral tones with warm accents');
//   const [showAdvanced, setShowAdvanced] = useState(false);

//   // ── File handlers ────────────────────────────────────────────────────────────
//   const handleFileSelect = useCallback((file) => {
//     if (!file) return;
//     if (!file.type.startsWith('image/')) {
//       toast.error('Please upload an image file (PNG, JPG, or WEBP)');
//       return;
//     }
//     if (file.size > 10 * 1024 * 1024) {
//       toast.error('File size must be under 10MB');
//       return;
//     }
//     setSketchFile(file);
//     setGeneratedImage(null);
//     setSavedToDesign(false);
//     setError(null);
//     const reader = new FileReader();
//     reader.onloadend = () => setSketchPreview(reader.result);
//     reader.readAsDataURL(file);
//   }, []);

//   const handleDrop = useCallback((e) => {
//     e.preventDefault();
//     setIsDragging(false);
//     const file = e.dataTransfer.files[0];
//     handleFileSelect(file);
//   }, [handleFileSelect]);

//   const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
//   const handleDragLeave = () => setIsDragging(false);

//   // ── Image → base64 ────────────────────────────────────────────────────────────
//   const fileToBase64 = (file) =>
//     new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onloadend = () => resolve(reader.result.split(',')[1]);
//       reader.onerror = reject;
//       reader.readAsDataURL(file);
//     });

//   // ── Build the prompt ──────────────────────────────────────────────────────────
//   const buildPrompt = () => {
//     const roomLabel = ROOM_TYPES.find(r => r.id === selectedRoom)?.label || selectedRoom;
//     const styleLabel = STYLE_PRESETS.find(s => s.id === selectedStyle)?.label || selectedStyle;
//     const lightingLabel = LIGHTING_OPTIONS.find(l => l.id === selectedLighting)?.label || selectedLighting;

//     let prompt = `You are an expert interior design visualizer for a platform called NewaEC that specializes in converting architectural sketches into photorealistic interior design renders.

// A designer has uploaded a pencil/hand-drawn sketch of a ${roomLabel}. Your task is to:

// 1. ANALYZE the sketch carefully — identify all structural elements, furniture placement, room proportions, doors, windows, and spatial relationships shown in the sketch.

// 2. GENERATE a detailed, photorealistic interior design description that brings this sketch to life as a real interior photo would look.

// 3. Apply the following design parameters:
//    - Style: ${styleLabel}
//    - Lighting: ${lightingLabel}
//    - Color Palette: ${colorPalette}
//    ${materialPreference ? `- Material Preferences: ${materialPreference}` : ''}
//    ${customRequirements ? `- Special Requirements: ${customRequirements}` : ''}
//    ${project ? `- Project Context: ${project.title || 'Interior design project'}` : ''}

// 4. OUTPUT FORMAT — Respond with a JSON object (no markdown, no backticks) like:
// {
//   "visualDescription": "A detailed paragraph describing the photorealistic render — describe lighting, textures, materials, colors, furniture, atmosphere, and mood as if viewing a real interior photograph. Be specific and vivid (200-300 words).",
//   "designHighlights": ["Highlight 1", "Highlight 2", "Highlight 3", "Highlight 4", "Highlight 5"],
//   "colorPalette": ["Color 1 with hex", "Color 2 with hex", "Color 3 with hex"],
//   "materialList": ["Material 1", "Material 2", "Material 3", "Material 4"],
//   "furnitureRecommendations": ["Item 1", "Item 2", "Item 3"],
//   "lightingPlan": "Description of the lighting scheme",
//   "estimatedBudgetRange": "₹X,XX,000 – ₹X,XX,000",
//   "designerNotes": "Professional notes about translating this sketch into reality",
//   "sketchAnalysis": "What was identified in the sketch: structures, layout, key elements",
//   "productionTips": "Tips for the fabrication/installation team"
// }`;

//     return prompt;
//   };

//   // ── API call via Anthropic (Claude Vision / NewaEC tool) ──────────────────────
//   const handleGenerate = async () => {
//     if (!sketchFile) {
//       toast.error('Please upload a sketch first');
//       return;
//     }

//     setIsGenerating(true);
//     setError(null);
//     setGenerationProgress(10);
//     setGenerationStage('Reading sketch...');
//     setSavedToDesign(false);

//     try {
//       const base64Image = await fileToBase64(sketchFile);
//       const mediaType = sketchFile.type || 'image/jpeg';

//       setGenerationProgress(25);
//       setGenerationStage('Analyzing architectural elements...');

//       // Call the server-side proxy to avoid CORS issues
//       const serverUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
//       const response = await fetch(`${serverUrl}/designer/ai/generate-visualization`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('token')}`,
//         },
//         body: JSON.stringify({
//           imageBase64: base64Image,
//           mediaType: mediaType,
//           prompt: buildPrompt(),
//         }),
//       });

//       setGenerationProgress(60);
//       setGenerationStage('Applying design styles...');

//       if (!response.ok) {
//         const errData = await response.json().catch(() => ({}));
//         throw new Error(errData.error || `Server error: ${response.status}`);
//       }

//       const data = await response.json();
//       setGenerationProgress(80);
//       setGenerationStage('Composing design output...');

//       if (!data.success) {
//         throw new Error(data.error || 'Generation failed on server');
//       }

//       const parsed = data.data;

//       setGenerationProgress(100);
//       setGenerationStage('Complete!');
//       setGeneratedImage(parsed);
//       setGenerationDescription(parsed.visualDescription || '');

//       // Save to history
//       setGenerationHistory(prev => [
//         {
//           id: Date.now(),
//           sketchPreview,
//           result: parsed,
//           room: selectedRoom,
//           style: selectedStyle,
//           timestamp: new Date().toLocaleTimeString()
//         },
//         ...prev.slice(0, 4)
//       ]);

//       toast.success('Design visualization generated!');
//     } catch (err) {
//       console.error('Generation error:', err);
//       setError(err.message || 'Generation failed. Please try again.');
//       toast.error('Generation failed: ' + (err.message || 'Unknown error'));
//     } finally {
//       setIsGenerating(false);
//       setTimeout(() => {
//         setGenerationProgress(0);
//         setGenerationStage('');
//       }, 1500);
//     }
//   };

//   // ── Save to design suggestion ─────────────────────────────────────────────────
//   const handleSaveToDesign = () => {
//     if (!generatedImage) return;
//     const designData = {
//       aiGeneratedVisualization: {
//         sketchAnalysis: generatedImage.sketchAnalysis,
//         visualDescription: generatedImage.visualDescription,
//         colorPalette: generatedImage.colorPalette,
//         materialList: generatedImage.materialList,
//         furnitureRecommendations: generatedImage.furnitureRecommendations,
//         lightingPlan: generatedImage.lightingPlan,
//         estimatedBudgetRange: generatedImage.estimatedBudgetRange,
//         designerNotes: generatedImage.designerNotes,
//         productionTips: generatedImage.productionTips,
//         designHighlights: generatedImage.designHighlights,
//         parameters: { room: selectedRoom, style: selectedStyle, lighting: selectedLighting }
//       },
//       designNotes: generatedImage.designerNotes,
//       suggestedTheme: STYLE_PRESETS.find(s => s.id === selectedStyle)?.label,
//     };
//     if (onSaveToDesign) onSaveToDesign(designData);
//     setSavedToDesign(true);
//     toast.success('Visualization saved to your design suggestion!');
//   };

//   const resetStudio = () => {
//     setSketchFile(null);
//     setSketchPreview(null);
//     setGeneratedImage(null);
//     setError(null);
//     setSavedToDesign(false);
//     if (fileInputRef.current) fileInputRef.current.value = '';
//   };

//   // ─── UI ────────────────────────────────────────────────────────────────────
//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl p-5 text-white">
//         <div className="flex items-center gap-3 mb-1">
//           <div className="bg-white/20 rounded-lg p-2">
//             <SparklesIcon className="h-6 w-6 text-white" />
//           </div>
//           <div>
//             <h2 className="text-lg font-bold">NewaEC Sketch-to-Real Studio</h2>
//             <p className="text-violet-200 text-sm">Transform pencil sketches into photorealistic interior visualizations using AI</p>
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
//         {/* ── Left Panel: Upload + Config ── */}
//         <div className="space-y-5">

//           {/* Sketch Upload */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
//             <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
//               <PaintBrushIcon className="h-4 w-4 text-violet-600" />
//               Upload Pencil Sketch
//             </h3>

//             {sketchPreview ? (
//               <div className="relative group rounded-lg overflow-hidden border-2 border-violet-200">
//                 <img src={sketchPreview} alt="Sketch" className="w-full max-h-56 object-contain bg-gray-50" />
//                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
//                   <button
//                     onClick={() => fileInputRef.current?.click()}
//                     className="bg-white text-gray-800 px-3 py-1.5 rounded-lg text-xs font-medium shadow"
//                   >Change</button>
//                   <button
//                     onClick={resetStudio}
//                     className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow"
//                   >Remove</button>
//                 </div>
//                 <div className="absolute top-2 left-2 bg-violet-600 text-white text-xs px-2 py-0.5 rounded-full">
//                   Sketch loaded ✓
//                 </div>
//               </div>
//             ) : (
//               <div
//                 onDrop={handleDrop}
//                 onDragOver={handleDragOver}
//                 onDragLeave={handleDragLeave}
//                 onClick={() => fileInputRef.current?.click()}
//                 className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
//                   isDragging ? 'border-violet-500 bg-violet-50' : 'border-gray-300 hover:border-violet-400 hover:bg-gray-50'
//                 }`}
//               >
//                 <CloudArrowUpIcon className="h-10 w-10 text-gray-400 mx-auto mb-3" />
//                 <p className="text-sm font-medium text-gray-600">Drag & drop your sketch here</p>
//                 <p className="text-xs text-gray-400 mt-1">or click to browse — PNG, JPG, WEBP (max 10MB)</p>
//               </div>
//             )}
//             <input
//               ref={fileInputRef}
//               type="file"
//               accept="image/*"
//               className="hidden"
//               onChange={(e) => handleFileSelect(e.target.files[0])}
//             />
//           </div>

//           {/* Room Type */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
//             <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
//               <HomeIcon className="h-4 w-4 text-violet-600" />
//               Room Type
//             </h3>
//             <div className="grid grid-cols-3 gap-2">
//               {ROOM_TYPES.map(room => (
//                 <button
//                   key={room.id}
//                   onClick={() => setSelectedRoom(room.id)}
//                   className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
//                     selectedRoom === room.id
//                       ? 'bg-violet-600 text-white border-violet-600'
//                       : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300'
//                   }`}
//                 >
//                   <span className="mr-1">{room.emoji}</span>{room.label}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Style Preset */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
//             <h3 className="text-sm font-semibold text-gray-700 mb-3">Design Style</h3>
//             <div className="grid grid-cols-2 gap-2">
//               {STYLE_PRESETS.map(style => (
//                 <button
//                   key={style.id}
//                   onClick={() => setSelectedStyle(style.id)}
//                   className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
//                     selectedStyle === style.id
//                       ? 'border-2 bg-gray-50'
//                       : 'border-gray-200 hover:border-gray-300'
//                   }`}
//                   style={selectedStyle === style.id ? { borderColor: style.color } : {}}
//                 >
//                   <span
//                     className="h-3 w-3 rounded-full flex-shrink-0"
//                     style={{ backgroundColor: style.color }}
//                   />
//                   {style.label}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Advanced Options */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
//             <button
//               onClick={() => setShowAdvanced(!showAdvanced)}
//               className="flex items-center justify-between w-full text-sm font-semibold text-gray-700"
//             >
//               <span className="flex items-center gap-2">
//                 <AdjustmentsHorizontalIcon className="h-4 w-4 text-violet-600" />
//                 Advanced Parameters
//               </span>
//               <span className="text-xs text-gray-400">{showAdvanced ? 'Hide' : 'Show'}</span>
//             </button>

//             {showAdvanced && (
//               <div className="mt-4 space-y-4">
//                 {/* Lighting */}
//                 <div>
//                   <label className="block text-xs font-medium text-gray-600 mb-2">Lighting</label>
//                   <div className="flex flex-wrap gap-2">
//                     {LIGHTING_OPTIONS.map(l => (
//                       <button
//                         key={l.id}
//                         onClick={() => setSelectedLighting(l.id)}
//                         className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
//                           selectedLighting === l.id
//                             ? 'bg-amber-50 border-amber-400 text-amber-700'
//                             : 'bg-white border-gray-200 text-gray-600 hover:border-amber-300'
//                         }`}
//                       >
//                         {l.label}
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Color palette */}
//                 <div>
//                   <label className="block text-xs font-medium text-gray-600 mb-1">Color Palette Preference</label>
//                   <input
//                     type="text"
//                     value={colorPalette}
//                     onChange={(e) => setColorPalette(e.target.value)}
//                     placeholder="e.g. neutral tones with warm accents"
//                     className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300"
//                   />
//                 </div>

//                 {/* Materials */}
//                 <div>
//                   <label className="block text-xs font-medium text-gray-600 mb-1">Material Preferences</label>
//                   <input
//                     type="text"
//                     value={materialPreference}
//                     onChange={(e) => setMaterialPreference(e.target.value)}
//                     placeholder="e.g. marble flooring, teak wood, brushed brass"
//                     className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300"
//                   />
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Custom Requirements */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
//             <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
//               <LightBulbIcon className="h-4 w-4 text-violet-600" />
//               Customer Requirements
//             </label>
//             <textarea
//               value={customRequirements}
//               onChange={(e) => setCustomRequirements(e.target.value)}
//               rows={3}
//               placeholder="Describe what the customer wants: storage solutions, specific furniture, accessibility needs, pet-friendly materials..."
//               className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none"
//             />
//           </div>

//           {/* Generate Button */}
//           <button
//             onClick={handleGenerate}
//             disabled={!sketchFile || isGenerating}
//             className={`w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
//               !sketchFile || isGenerating
//                 ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                 : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-violet-200 active:scale-[0.98]'
//             }`}
//           >
//             {isGenerating ? (
//               <>
//                 <ArrowPathIcon className="h-4 w-4 animate-spin" />
//                 {generationStage || 'Generating...'}
//               </>
//             ) : (
//               <>
//                 <SparklesIcon className="h-4 w-4" />
//                 Generate Realistic Visualization
//               </>
//             )}
//           </button>

//           {/* Progress bar */}
//           {isGenerating && (
//             <div className="bg-white rounded-xl border border-gray-100 p-4">
//               <div className="flex justify-between text-xs text-gray-500 mb-2">
//                 <span>{generationStage}</span>
//                 <span>{generationProgress}%</span>
//               </div>
//               <div className="w-full bg-gray-100 rounded-full h-2">
//                 <div
//                   className="bg-gradient-to-r from-violet-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
//                   style={{ width: `${generationProgress}%` }}
//                 />
//               </div>
//             </div>
//           )}

//           {/* Error */}
//           {error && (
//             <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
//               <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
//               <div>
//                 <p className="text-sm font-medium text-red-700">Generation Failed</p>
//                 <p className="text-xs text-red-500 mt-0.5">{error}</p>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* ── Right Panel: Results ── */}
//         <div className="space-y-5">
//           {!generatedImage && !isGenerating && (
//             <div className="bg-white rounded-xl shadow-sm border border-dashed border-gray-200 p-12 text-center h-full flex flex-col items-center justify-center">
//               <div className="bg-violet-50 rounded-2xl p-5 mb-4">
//                 <PhotoIcon className="h-12 w-12 text-violet-300 mx-auto" />
//               </div>
//               <p className="text-sm font-medium text-gray-500">Your AI visualization will appear here</p>
//               <p className="text-xs text-gray-400 mt-1">Upload a sketch and click Generate</p>
//             </div>
//           )}

//           {generatedImage && (
//             <>
//               {/* Visual Description Card */}
//               <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl border border-violet-100 p-5">
//                 <div className="flex items-center justify-between mb-3">
//                   <h3 className="text-sm font-bold text-violet-900 flex items-center gap-2">
//                     <SparklesIcon className="h-4 w-4" />
//                     NewaEC Visual Render Description
//                   </h3>
//                   <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">AI Generated</span>
//                 </div>
//                 <p className="text-sm text-gray-700 leading-relaxed">{generatedImage.visualDescription}</p>
//               </div>

//               {/* Sketch Analysis */}
//               {generatedImage.sketchAnalysis && (
//                 <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
//                   <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Sketch Analysis</h4>
//                   <p className="text-sm text-gray-600">{generatedImage.sketchAnalysis}</p>
//                 </div>
//               )}

//               {/* Design Highlights */}
//               {generatedImage.designHighlights?.length > 0 && (
//                 <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
//                   <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Design Highlights</h4>
//                   <ul className="space-y-2">
//                     {generatedImage.designHighlights.map((h, i) => (
//                       <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
//                         <CheckCircleIcon className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
//                         {h}
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               )}

//               {/* Color + Materials grid */}
//               <div className="grid grid-cols-2 gap-4">
//                 {/* Color Palette */}
//                 <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
//                   <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Color Palette</h4>
//                   <div className="space-y-1.5">
//                     {generatedImage.colorPalette?.map((color, i) => (
//                       <div key={i} className="flex items-center gap-2">
//                         <div
//                           className="h-4 w-4 rounded-sm border border-gray-200 flex-shrink-0"
//                           style={{ backgroundColor: color.match(/#[0-9a-fA-F]{3,6}/)?.[0] || '#e5e7eb' }}
//                         />
//                         <span className="text-xs text-gray-600 truncate">{color}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Materials */}
//                 <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
//                   <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Materials</h4>
//                   <ul className="space-y-1">
//                     {generatedImage.materialList?.map((m, i) => (
//                       <li key={i} className="text-xs text-gray-600 flex items-center gap-1.5">
//                         <span className="h-1.5 w-1.5 rounded-full bg-violet-400 flex-shrink-0" />
//                         {m}
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               </div>

//               {/* Furniture + Lighting */}
//               <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Furniture Plan</h4>
//                     <ul className="space-y-1">
//                       {generatedImage.furnitureRecommendations?.map((f, i) => (
//                         <li key={i} className="text-xs text-gray-600">• {f}</li>
//                       ))}
//                     </ul>
//                   </div>
//                   <div>
//                     <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Lighting</h4>
//                     <p className="text-xs text-gray-600">{generatedImage.lightingPlan}</p>
//                     {generatedImage.estimatedBudgetRange && (
//                       <div className="mt-3">
//                         <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Budget Range</h4>
//                         <p className="text-sm font-semibold text-emerald-700">{generatedImage.estimatedBudgetRange}</p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Designer Notes */}
//               {generatedImage.designerNotes && (
//                 <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
//                   <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">Designer Notes</h4>
//                   <p className="text-sm text-amber-800">{generatedImage.designerNotes}</p>
//                 </div>
//               )}

//               {/* Production Tips */}
//               {generatedImage.productionTips && (
//                 <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
//                   <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">Production Tips</h4>
//                   <p className="text-sm text-blue-800">{generatedImage.productionTips}</p>
//                 </div>
//               )}

//               {/* Action Buttons */}
//               <div className="flex gap-3">
//                 {onSaveToDesign && !savedToDesign && (
//                   <button
//                     onClick={handleSaveToDesign}
//                     className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors"
//                   >
//                     <ArrowDownTrayIcon className="h-4 w-4" />
//                     Save to Design Suggestion
//                   </button>
//                 )}
//                 {savedToDesign && (
//                   <div className="flex-1 bg-emerald-50 border border-emerald-200 text-emerald-700 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
//                     <CheckCircleIcon className="h-4 w-4" />
//                     Saved to Design
//                   </div>
//                 )}
//                 <button
//                   onClick={handleGenerate}
//                   disabled={isGenerating}
//                   className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
//                 >
//                   <ArrowPathIcon className="h-4 w-4" />
//                   Regenerate
//                 </button>
//                 <button
//                   onClick={resetStudio}
//                   className="p-2.5 border border-gray-200 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-red-400 transition-colors"
//                 >
//                   <XMarkIcon className="h-4 w-4" />
//                 </button>
//               </div>
//             </>
//           )}
//         </div>
//       </div>

//       {/* Generation History */}
//       {generationHistory.length > 0 && (
//         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
//           <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
//             <DocumentDuplicateIcon className="h-4 w-4 text-violet-600" />
//             Recent Generations (this session)
//           </h3>
//           <div className="flex gap-3 overflow-x-auto pb-2">
//             {generationHistory.map(item => (
//               <div
//                 key={item.id}
//                 className="flex-shrink-0 w-36 border border-gray-100 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
//                 onClick={() => {
//                   setGeneratedImage(item.result);
//                   setSketchPreview(item.sketchPreview);
//                   setSelectedRoom(item.room);
//                   setSelectedStyle(item.style);
//                 }}
//               >
//                 <img src={item.sketchPreview} alt="History" className="w-full h-24 object-contain bg-gray-50" />
//                 <div className="p-2">
//                   <p className="text-xs font-medium text-gray-600 truncate">
//                     {ROOM_TYPES.find(r => r.id === item.room)?.label}
//                   </p>
//                   <p className="text-xs text-gray-400">{item.timestamp}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SketchToRealStudio;