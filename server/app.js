const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// IMPORTANT: Load models first
require('./models/User');
require('./models/Project');
require('./models/Material');
require('./models/Quotation');

// Import routes
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const quotationRoutes = require('./routes/quotationRoutes');
const materialRoutes = require('./routes/materialRoutes');
const gstRoutes = require('./routes/gstRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Debug route imports
console.log('authRoutes type:', typeof authRoutes);
console.log('projectRoutes type:', typeof projectRoutes);
console.log('quotationRoutes type:', typeof quotationRoutes);
console.log('materialRoutes type:', typeof materialRoutes);
console.log('gstRoutes type:', typeof gstRoutes);

// Import middleware
const errorHandler = require('./middleware/errorMiddleware');
console.log('errorHandler type:', typeof errorHandler);
console.log('errorHandler:', errorHandler);

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
console.log('Mounting authRoutes...');
app.use('/api/auth', authRoutes);

console.log('Mounting projectRoutes...');
app.use('/api/projects', projectRoutes);

console.log('Mounting quotationRoutes...');
app.use('/api/quotations', quotationRoutes);

console.log('Mounting materialRoutes...');
app.use('/api/materials', materialRoutes);

console.log('Mounting gstRoutes...');
app.use('/api/gst', gstRoutes);

app.use('/api/dashboard', dashboardRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Smart Seller API' });
});

// Error middleware
console.log('About to mount errorHandler...');
console.log('errorHandler at mount time:', typeof errorHandler, errorHandler.name);
app.use(errorHandler);

console.log('Error handler mounted successfully');

module.exports = app;