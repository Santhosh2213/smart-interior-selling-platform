const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Debug: Check if variables are loaded
console.log('=== Cloudinary Config Debug ===');
console.log('CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API_KEY:', process.env.CLOUDINARY_API_KEY ? '✓ Loaded' : '✗ Missing');
console.log('API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✓ Loaded' : '✗ Missing');
console.log('==============================');

// Validate credentials
if (!process.env.CLOUDINARY_CLOUD_NAME || 
    !process.env.CLOUDINARY_API_KEY || 
    !process.env.CLOUDINARY_API_SECRET) {
  console.error('❌ Missing Cloudinary credentials in .env file');
  console.error('Please check your server/.env file and add:');
  console.error('CLOUDINARY_CLOUD_NAME=your_cloud_name');
  console.error('CLOUDINARY_API_KEY=your_api_key');
  console.error('CLOUDINARY_API_SECRET=your_api_secret');
  process.exit(1);
}

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Test the connection
cloudinary.api.ping()
  .then(result => {
    console.log('✅ Cloudinary connection successful');
  })
  .catch(error => {
    console.error('❌ Cloudinary connection failed:', error.message);
    console.error('Please verify your Cloudinary credentials');
  });

// Configure storage
let storage;
try {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'smart-seller/projects',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
    }
  });
  console.log('✅ Cloudinary storage configured successfully');
} catch (error) {
  console.error('❌ Failed to configure Cloudinary storage:', error.message);
  process.exit(1);
}

// Create multer upload instance
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

module.exports = { cloudinary, upload };