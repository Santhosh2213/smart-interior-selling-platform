const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// IMPORTANT: Load all models first
require('./models/User');
require('./models/Customer');
require('./models/Designer');
require('./models/Seller');
require('./models/Project');
require('./models/Measurement');
require('./models/ProjectImage');
require('./models/Material');
require('./models/GSTCategory');
require('./models/Quotation');
require('./models/DesignSuggestion');      // Add this
require('./models/DesignerSuggestion');    // Add this for legacy
require('./models/Notification');
require('./models/Chat');

// Import routes
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const quotationRoutes = require('./routes/quotationRoutes');
const materialRoutes = require('./routes/materialRoutes');
const gstRoutes = require('./routes/gstRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const chatRoutes = require('./routes/chatRoutes');
const designerRoutes = require('./routes/designerRoutes');

// Import middleware
const errorHandler = require('./middleware/errorMiddleware');

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/gst', gstRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/designer', designerRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Smart Seller API' });
});

// Error middleware
app.use(errorHandler);

module.exports = app;