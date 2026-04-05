const axios = require('axios');

async function testImageGeneration() {
  const API_KEY = 'infip-af4b21ba';
  const API_URL = 'https://api.infip.pro';
  
  console.log('🎨 Testing image generation...');
  
  try {
    const response = await axios.post(`${API_URL}/v1/images/generations`, {
      model: 'img4',
      prompt: 'A modern living room with large windows, wooden flooring, minimalist furniture, warm lighting',
      n: 1,
      size: '1024x1024',
      response_format: 'url'
    }, {
      headers: { 
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 60000
    });
    
    console.log('✅ Image generated successfully!');
    console.log('Image URL:', response.data.data[0].url);
    
  } catch (error) {
    console.error('❌ Generation failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    }
  }
}

testImageGeneration();