const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Designer = require('../models/Designer');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

// Debug: Check if MONGO_URI is loaded
console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ Found' : '❌ Not found');

const seedDesigner = async () => {
  try {
    // Validate MONGO_URI
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in .env file');
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if designer already exists
    const existingDesigner = await Designer.findOne();
    if (existingDesigner) {
      console.log('⚠️ Designer already exists');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'designer@smartseller.com' });
    if (existingUser) {
      console.log('⚠️ Designer user already exists');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Create designer user
    const designerUser = await User.create({
      name: 'Designer Pro',
      email: 'designer@smartseller.com',
      password: 'designer123',
      role: 'designer',
      phone: '9876543211',
      isEmailVerified: true,
      isPhoneVerified: true
    });

    console.log('✅ Designer user created');

    // Create designer profile
    const designer = await Designer.create({
      userId: designerUser._id,
      specialization: ['residential', 'commercial'],
      experience: 8,
      bio: 'Experienced interior designer specializing in modern homes and offices',
      portfolio: [
        {
          title: 'Modern Apartment',
          description: 'Complete interior design for 3BHK apartment',
          projectDate: new Date('2024-01-15'),
          images: [] // Added for future image uploads
        }
      ],
      status: 'active',
      rating: 0,
      totalProjects: 0
    });

    console.log('✅ Designer profile created successfully');
    console.log('\n📝 SEEDER COMPLETED:');
    console.log('------------------------');
    console.log('Email: designer@smartseller.com');
    console.log('Password: designer123');
    console.log('Specialization: Residential, Commercial');
    console.log('Experience: 8 years');
    console.log('------------------------\n');
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding designer:', error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

seedDesigner();