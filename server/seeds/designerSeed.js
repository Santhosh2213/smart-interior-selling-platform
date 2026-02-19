const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Designer = require('../models/Designer');

dotenv.config();

const seedDesigner = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if designer already exists
    const existingDesigner = await Designer.findOne();
    if (existingDesigner) {
      console.log('Designer already exists');
      process.exit(0);
    }

    // Create designer user
    const designerUser = await User.create({
      name: 'Designer Pro',
      email: 'designer@smartseller.com',
      password: 'designer123',
      role: 'designer',
      phone: '9876543211'
    });

    // Create designer profile
    const designer = await Designer.create({
      userId: designerUser._id,
      specialization: ['residential', 'commercial', 'modern', 'minimalist'],
      experience: 8,
      bio: 'Experienced interior designer specializing in modern homes and offices',
      portfolio: [
        {
          title: 'Modern Apartment',
          description: 'Complete interior design for 3BHK apartment',
          projectDate: new Date('2024-01-15')
        }
      ]
    });

    console.log('✅ Designer seeded successfully');
    console.log('Email: designer@smartseller.com');
    console.log('Password: designer123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding designer:', error);
    process.exit(1);
  }
};

seedDesigner();