const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test Routes
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Server is running!',
    timestamp: new Date().toISOString(),
    server: 'Express',
    status: 'active'
  });
});

app.get('/api/test/db', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    res.json({
      success: true,
      message: `Database is ${states[dbState]}`,
      state: dbState,
      host: mongoose.connection.host || 'not connected'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Fixed Seller Login Test
app.post('/api/test/seller-login', (req, res) => {
  const { email, password } = req.body;
  
  // Fixed credentials
  if (email === 'seller@example.com' && password === 'seller123') {
    res.json({
      success: true,
      message: 'Seller login successful',
      user: {
        id: 1,
        email: 'seller@example.com',
        role: 'seller',
        name: 'Demo Seller'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid seller credentials'
    });
  }
});

// Fixed Designer Login Test
app.post('/api/test/designer-login', (req, res) => {
  const { email, password } = req.body;
  
  // Fixed credentials
  if (email === 'designer@example.com' && password === 'designer123') {
    res.json({
      success: true,
      message: 'Designer login successful',
      user: {
        id: 2,
        email: 'designer@example.com',
        role: 'designer',
        name: 'Demo Designer'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid designer credentials'
    });
  }
});

// Customer Registration Test
app.post('/api/test/customer-register', (req, res) => {
  const { name, email, phone, password } = req.body;
  
  // Simple validation
  if (!name || !email || !phone || !password) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }
  
  res.json({
    success: true,
    message: 'Customer registered successfully (test mode)',
    user: {
      id: Date.now(),
      name,
      email,
      phone,
      role: 'customer'
    }
  });
});

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart-seller-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  🚀 Server is running!
  📡 Port: ${PORT}
  🔗 URL: http://localhost:${PORT}
  🧪 Test API: http://localhost:${PORT}/api/test
  `);
});