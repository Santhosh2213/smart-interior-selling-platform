import api from './api';

// Generate image from text prompt
export const generateImage = async (prompt, options = {}) => {
  try {
    const response = await api.post('/designer/ai/generate-image', {
      prompt,
      negativePrompt: options.negativePrompt || '',
      width: options.width || 1024,
      height: options.height || 1024,
      style: options.style || 'interior-design',
      numInferenceSteps: options.numInferenceSteps || 30,
      guidanceScale: options.guidanceScale || 7.5
    });
    return response.data;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
};

// Image to Image transformation (Sketch to Real)
export const imageToImage = async (imageBase64, prompt, strength = 0.7) => {
  try {
    const response = await api.post('/designer/ai/image-to-image', {
      imageBase64,
      prompt,
      strength
    });
    return response.data;
  } catch (error) {
    console.error('Error in image-to-image:', error);
    throw error;
  }
};

// Get AI prompt suggestions
export const getPromptSuggestions = async (roomType, style, preferences) => {
  try {
    const response = await api.post('/designer/ai/suggest-prompts', {
      roomType,
      style,
      preferences
    });
    return response.data;
  } catch (error) {
    console.error('Error getting prompt suggestions:', error);
    throw error;
  }
};

// Test GhostBot connection
export const testGhostBotConnection = async () => {
  try {
    const response = await api.get('/designer/ai/test-connection');
    return response.data;
  } catch (error) {
    console.error('Error testing connection:', error);
    throw error;
  }
};

export default {
  generateImage,
  imageToImage,
  getPromptSuggestions,
  testGhostBotConnection
};