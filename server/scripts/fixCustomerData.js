const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
require('../models/User');
require('../models/Customer');
require('../models/Project');
require('../models/Measurement');
require('../models/ProjectImage');

const User = require('../models/User');
const Customer = require('../models/Customer');
const Project = require('../models/Project');

const fixCustomerData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find all projects
    const projects = await Project.find();
    console.log(`Found ${projects.length} projects`);

    for (const project of projects) {
      console.log(`\nChecking project: ${project.title} (${project._id})`);
      
      // Check if customer exists
      if (!project.customerId) {
        console.log('  ❌ No customerId, creating default customer...');
        
        // Create a default customer
        let defaultUser = await User.findOne({ email: 'default@customer.com' });
        if (!defaultUser) {
          defaultUser = await User.create({
            name: 'Default Customer',
            email: 'default@customer.com',
            password: '$2a$10$YourHashedPasswordHere', // You'll need to hash this
            role: 'customer',
            isActive: true
          });
          console.log('  ✅ Created default user');
        }

        let defaultCustomer = await Customer.findOne({ userId: defaultUser._id });
        if (!defaultCustomer) {
          defaultCustomer = await Customer.create({
            userId: defaultUser._id,
            name: 'Default Customer',
            email: 'default@customer.com',
            phone: '0000000000'
          });
          console.log('  ✅ Created default customer');
        }

        project.customerId = defaultCustomer._id;
        await project.save();
        console.log('  ✅ Updated project with default customer');
      } else {
        // Verify customer exists
        const customer = await Customer.findById(project.customerId).populate('userId');
        if (customer) {
          console.log(`  ✅ Customer found: ${customer.name || customer.userId?.name || 'Unknown'}`);
        } else {
          console.log('  ❌ Customer not found in database');
          
          // Create a new customer
          let newUser = await User.findOne({ email: 'recovered@customer.com' });
          if (!newUser) {
            newUser = await User.create({
              name: 'Recovered Customer',
              email: 'recovered@customer.com',
              password: '$2a$10$YourHashedPasswordHere',
              role: 'customer',
              isActive: true
            });
          }

          const newCustomer = await Customer.create({
            userId: newUser._id,
            name: 'Recovered Customer',
            email: 'recovered@customer.com',
            phone: '1111111111'
          });

          project.customerId = newCustomer._id;
          await project.save();
          console.log('  ✅ Created and assigned new customer');
        }
      }

      // Count measurements
      const Measurement = mongoose.model('Measurement');
      const measurements = await Measurement.find({ projectId: project._id });
      console.log(`  📊 Measurements: ${measurements.length}`);

      // Count images
      const ProjectImage = mongoose.model('ProjectImage');
      const images = await ProjectImage.find({ projectId: project._id });
      console.log(`  📸 Images: ${images.length}`);
    }

    console.log('\n✅ Customer data fix completed');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixCustomerData();