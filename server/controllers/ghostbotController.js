/**
 * ghostbotController.js
 * GhostBot/Infip AI Image Generation Integration
 * Based on official API documentation: https://api.infip.pro
 */

const axios = require('axios');

const GHOSTBOT_API_URL = process.env.GHOSTBOT_API_URL || 'https://api.infip.pro';
const GHOSTBOT_API_KEY = process.env.GHOSTBOT_API_KEY;

// Available models
const MODELS = {
  FAST: 'img4',           // Fast, good quality
  PREMIUM: 'nbpro',       // Premium quality (async)
  ULTRA: 'flux-schnell',  // Ultra-fast
  STANDARD: 'sdxl',       // Standard SDXL
  LITE: 'sdxl-lite',      // Lightweight
  QWEN: 'qwen',           // Qwen model (async)
  NANO: 'nano-banana'     // Nano banana (async)
};

// @desc    Generate image from text prompt using GhostBot
// @route   POST /api/designer/ai/generate-image
// @access  Private (Designer only)
const generateImage = async (req, res) => {
  try {
    const { 
      prompt, 
      model = MODELS.FAST, 
      n = 1, 
      size = '1024x1024',
      response_format = 'url'
    } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    if (!GHOSTBOT_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'GHOSTBOT_API_KEY is not configured in .env file',
        details: 'Please add your GhostBot API key to server/.env'
      });
    }

    console.log('🎨 Generating image with GhostBot...');
    console.log('Prompt:', prompt.substring(0, 100));
    console.log('Model:', model);
    console.log('Size:', size);

    const url = `${GHOSTBOT_API_URL}/v1/images/generations`;
    
    const requestData = {
      model: model,
      prompt: prompt,
      n: n,
      size: size,
      response_format: response_format
    };

    const response = await axios.post(url, requestData, {
      headers: {
        'Authorization': `Bearer ${GHOSTBOT_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 120000 // 2 minutes timeout
    });

    console.log('GhostBot response status:', response.status);

    // Check if response contains task_id (async model)
    if (response.data.task_id) {
      // Handle async model - poll for result
      const taskId = response.data.task_id;
      console.log('Async task created:', taskId);
      
      // Poll for result
      const result = await pollTaskResult(taskId);
      
      return res.json({
        success: true,
        async: true,
        data: result,
        taskId: taskId
      });
    }

    // Sync response
    const images = response.data.data || [];
    
    res.json({
      success: true,
      data: {
        images: images.map(img => ({ url: img.url })),
        prompt: prompt,
        model: model,
        size: size,
        created: response.data.created,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('GhostBot generation error:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      
      // Handle specific error codes
      if (error.response.status === 401) {
        return res.status(401).json({
          success: false,
          error: 'Invalid or missing GhostBot API key',
          details: 'Please check your GHOSTBOT_API_KEY in .env file'
        });
      }
      
      if (error.response.status === 429) {
        return res.status(429).json({
          success: false,
          error: 'Rate limit exceeded. Please try again later.',
          details: 'Free tier: 30 requests/minute, 1000 requests/day'
        });
      }
      
      return res.status(error.response.status).json({
        success: false,
        error: error.response.data?.message || 'GhostBot API error',
        details: error.response.data
      });
    }
    
    if (error.response?.status === 502) {
      return res.status(503).json({
          success: false,
          error: "AI Image Generation is temporarily unavailable. Please try again later."
      });
  }
  
  res.status(500).json({
      success: false,
      error: error.message || "Failed to generate image"
  });
  }
};

// @desc    Poll async task for result
const pollTaskResult = async (taskId, maxAttempts = 30, interval = 2000) => {
  for (let i = 0; i < maxAttempts; i++) {
    console.log(`Polling task ${taskId}, attempt ${i + 1}/${maxAttempts}`);
    
    await new Promise(resolve => setTimeout(resolve, interval));
    
    try {
      const response = await axios.get(`${GHOSTBOT_API_URL}/v1/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${GHOSTBOT_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.status === 'completed') {
        return response.data.data || response.data.images || [];
      }
      
      if (response.data.status === 'failed') {
        throw new Error(response.data.error || 'Task failed');
      }
      
      // Still pending, continue polling
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Polling error:', error.message);
      }
    }
  }
  
  throw new Error('Task timeout after ' + (maxAttempts * interval / 1000) + ' seconds');
};

// @desc    Generate image from sketch (Image-to-Image)
// @route   POST /api/designer/ai/image-to-image
// @access  Private (Designer only)
const imageToImage = async (req, res) => {
  try {
    const { 
      imageBase64, 
      prompt, 
      model = MODELS.NANO,
      strength = 0.7,
      size = '1024x1024'
    } = req.body;

    if (!imageBase64 || !prompt) {
      return res.status(400).json({
        success: false,
        error: 'Image and prompt are required'
      });
    }

    if (!GHOSTBOT_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'GHOSTBOT_API_KEY is not configured'
      });
    }

    console.log('🎨 Editing image with GhostBot...');
    console.log('Prompt:', prompt.substring(0, 100));

    const url = `${GHOSTBOT_API_URL}/v1/images/edits`;
    
    // For image edits, we need to send as multipart/form-data
    const formData = new FormData();
    formData.append('image', imageBase64);
    formData.append('prompt', prompt);
    formData.append('model', model);
    formData.append('strength', strength);
    formData.append('size', size);
    formData.append('response_format', 'url');

    const response = await axios.post(url, formData, {
      headers: {
        'Authorization': `Bearer ${GHOSTBOT_API_KEY}`,
        'Content-Type': 'multipart/form-data'
      },
      timeout: 120000
    });

    // Handle async response
    if (response.data.task_id) {
      const result = await pollTaskResult(response.data.task_id);
      return res.json({
        success: true,
        data: { images: result }
      });
    }

    res.json({
      success: true,
      data: {
        images: response.data.data || [],
        originalPrompt: prompt,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Image-to-image error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to transform image'
    });
  }
};

// @desc    Get available models
// @route   GET /api/designer/ai/models
// @access  Private (Designer only)
const getModels = async (req, res) => {
  try {
    if (!GHOSTBOT_API_KEY) {
      return res.json({
        success: false,
        configured: false,
        models: [
          { id: 'img4', name: 'Fast', description: 'Fast generation, good quality' },
          { id: 'img3', name: 'Standard', description: 'Standard quality' },
          { id: 'flux-schnell', name: 'Ultra Fast', description: 'Ultra-fast generation' },
          { id: 'sdxl', name: 'SDXL', description: 'High quality SDXL' },
          { id: 'sdxl-lite', name: 'SDXL Lite', description: 'Lightweight SDXL' },
          { id: 'nbpro', name: 'Premium', description: 'Premium quality (async)' },
          { id: 'qwen', name: 'Qwen', description: 'Qwen model (async)' },
          { id: 'nano-banana', name: 'Nano Banana', description: 'Nano banana (async)' }
        ]
      });
    }

    const response = await axios.get(`${GHOSTBOT_API_URL}/v1/models`, {
      headers: {
        'Authorization': `Bearer ${GHOSTBOT_API_KEY}`
      }
    });

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Error fetching models:', error.message);
    res.json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Test GhostBot API connection
// @route   GET /api/designer/ai/test-ghostbot
// @access  Private (Designer only)
const testGhostBot = async (req, res) => {
  try {
    if (!GHOSTBOT_API_KEY) {
      return res.json({
        success: false,
        configured: false,
        message: 'GHOSTBOT_API_KEY not configured in .env',
        apiKey: 'missing'
      });
    }

    // Try to fetch models to test connection
    const response = await axios.get(`${GHOSTBOT_API_URL}/v1/models`, {
      headers: {
        'Authorization': `Bearer ${GHOSTBOT_API_KEY}`
      },
      timeout: 10000
    });

    res.json({
      success: true,
      configured: true,
      message: 'GhostBot API connection successful',
      apiKey: 'configured',
      models: response.data?.data?.length || 0
    });
  } catch (error) {
    res.json({
      success: false,
      configured: true,
      message: 'API key configured but connection failed',
      error: error.message,
      status: error.response?.status
    });
  }
};

module.exports = {
  generateImage,
  imageToImage,
  getModels,
  testGhostBot,
  MODELS
};