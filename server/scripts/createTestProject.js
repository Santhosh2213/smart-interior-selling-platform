const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import all models
require('../models/User');
require('../models/Customer');
require('../models/Designer');
require('../models/Seller');
require('../models/Project');
require('../models/Measurement');
require('../models/ProjectImage');
require('../models/Material');
require('../models/GSTCategory');
require('../models/Quotation');
require('../models/DesignSuggestion');
require('../models/Notification');
require('../models/Chat');

const User = require('../models/User');
const Customer = require('../models/Customer');
const Project = require('../models/Project');

const createTestProject = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find a customer user
    const customerUser = await User.findOne({ role: 'customer' });
    if (!customerUser) {
      console.log('No customer found. Creating a test customer...');
      
      // Create a test customer user
      const newUser = await User.create({
        name: 'Test Customer',
        email: 'testcustomer@example.com',
        password: '$2a$10$YourHashedPasswordHere', // You'll need to hash this properly
        role: 'customer',
        isActive: true
      });
      
      // Create customer profile
      const newCustomer = await Customer.create({
        userId: newUser._id,
        name: 'Test Customer',
        email: 'testcustomer@example.com',
        phone: '9876543210',
        address: 'Test Address'
      });
      
      console.log('Created test customer:', newCustomer.name);
      
      // Create a test project
      const project = await Project.create({
        customerId: newCustomer._id,
        title: 'Test Bedroom Design',
        description: 'Need modern bedroom design with wooden flooring',
        status: 'PENDING_DESIGN',
        measurementUnit: 'feet',
        totalArea: 250
      });

      console.log('✅ Test project created successfully:');
      console.log({
        id: project._id,
        title: project.title,
        status: project.status,
        customer: newCustomer.name
      });
    } else {
      // Find or create customer profile
      let customer = await Customer.findOne({ userId: customerUser._id });
      if (!customer) {
        customer = await Customer.create({
          userId: customerUser._id,
          name: customerUser.name || 'Test Customer',
          email: customerUser.email,
          phone: '9999999999',
          address: 'Default Address'
        });
        console.log('Created customer profile');
      }

      // Create a test project
      const project = await Project.create({
        customerId: customer._id,
        title: 'Test Bedroom Design',
        description: 'Need modern bedroom design with wooden flooring',
        status: 'PENDING_DESIGN',
        measurementUnit: 'feet',
        totalArea: 250
      });

      console.log('✅ Test project created successfully:');
      console.log({
        id: project._id,
        title: project.title,
        status: project.status,
        customer: customer.name
      });
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

createTestProject();