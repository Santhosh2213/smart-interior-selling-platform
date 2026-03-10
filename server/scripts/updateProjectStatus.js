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

const Project = require('../models/Project');

const updateProjectStatus = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Update projects with 'pending' status to 'PENDING_DESIGN'
    const result = await Project.updateMany(
      { status: 'pending' },
      { $set: { status: 'PENDING_DESIGN' } }
    );
    
    console.log(`Updated ${result.modifiedCount} projects from 'pending' to 'PENDING_DESIGN'`);

    // Show all projects without population first (to avoid populate errors)
    const projects = await Project.find()
      .select('title status customerId createdAt');
    
    console.log('\nCurrent projects in database:');
    for (const p of projects) {
      let customerName = 'Unknown';
      try {
        // Try to get customer name separately
        const Customer = mongoose.model('Customer');
        const customer = await Customer.findById(p.customerId);
        customerName = customer ? customer.name : 'Unknown';
      } catch (err) {
        // Ignore populate errors
      }
      console.log(`- ${p.title} (Status: ${p.status}) - Customer: ${customerName}`);
    }

    await mongoose.disconnect();
    console.log('\nDone');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

updateProjectStatus();