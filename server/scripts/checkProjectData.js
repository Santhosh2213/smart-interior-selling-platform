const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const checkProjectData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    // Check Users
    const User = mongoose.model('User');
    const users = await User.find({ role: 'customer' });
    console.log(`📊 Users with customer role: ${users.length}`);
    users.forEach(u => console.log(`   - ${u.name} (${u.email})`));

    // Check Customers
    const Customer = mongoose.model('Customer');
    const customers = await Customer.find().populate('userId');
    console.log(`\n📊 Customer profiles: ${customers.length}`);
    customers.forEach(c => {
      console.log(`   - ${c.name} (User: ${c.userId?.name || 'No user'})`);
    });

    // Check Projects
    const Project = mongoose.model('Project');
    const projects = await Project.find();
    console.log(`\n📊 Projects: ${projects.length}`);
    
    for (const p of projects) {
      // Get customer
      const customer = await Customer.findById(p.customerId).populate('userId');
      
      // Get measurements
      const Measurement = mongoose.model('Measurement');
      const measurements = await Measurement.find({ projectId: p._id });
      
      // Get images
      const ProjectImage = mongoose.model('ProjectImage');
      const images = await ProjectImage.find({ projectId: p._id });
      
      console.log(`\n🔍 Project: ${p.title} (${p._id})`);
      console.log(`   Status: ${p.status}`);
      console.log(`   Customer ID: ${p.customerId}`);
      console.log(`   Customer Name: ${customer?.name || customer?.userId?.name || 'NOT FOUND'}`);
      console.log(`   Measurements: ${measurements.length}`);
      console.log(`   Images: ${images.length}`);
      
      if (!customer) {
        console.log(`   ⚠️  WARNING: Customer not found!`);
      }
    }

    await mongoose.disconnect();
    
  } catch (error) {
    console.error('Error:', error);
  }
};

// Register models
require('../models/User');
require('../models/Customer');
require('../models/Project');
require('../models/Measurement');
require('../models/ProjectImage');

checkProjectData();