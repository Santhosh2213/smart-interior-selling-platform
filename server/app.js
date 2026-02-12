const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: './.env' });

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Smart Seller Platform API',
    status: 'active',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes - Comment out until route files are created
try {
  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/customers', require('./routes/customerRoutes'));
  app.use('/api/projects', require('./routes/projectRoutes'));
  app.use('/api/measurements', require('./routes/measurementRoutes'));
  app.use('/api/materials', require('./routes/materialRoutes'));
  app.use('/api/quotations', require('./routes/quotationRoutes'));
  app.use('/api/gst', require('./routes/gstRoutes'));
  app.use('/api/orders', require('./routes/orderRoutes'));
  app.use('/api/invoices', require('./routes/invoiceRoutes'));
  app.use('/api/payments', require('./routes/paymentRoutes'));
  app.use('/api/reports', require('./routes/reportRoutes'));
  app.use('/api/chat', require('./routes/chatRoutes'));
  app.use('/api/notifications', require('./routes/notificationRoutes'));
} catch (error) {
  console.log('⚠️ Some routes not yet implemented:', error.message);
}

// Error Handler
app.use(require('./middleware/errorMiddleware'));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl 
  });
});

module.exports = app;