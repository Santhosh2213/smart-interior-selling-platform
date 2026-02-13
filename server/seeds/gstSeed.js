const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const GSTCategory = require('../models/GSTCategory');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

// Debug: Check if MONGO_URI is loaded
console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ Found' : '❌ Not found');

const seedGST = async () => {
  try {
    // Validate MONGO_URI
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in .env file');
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await GSTCategory.deleteMany({});
    console.log('✅ Cleared existing GST categories');

    // ONLY USE CATEGORIES THAT EXIST IN YOUR MODEL'S ENUM
    const gstCategories = [
      {
        materialCategory: 'tiles',
        hsnCode: '6907',
        cgst: 2.5,
        sgst: 2.5,
        igst: 5,
        description: 'Ceramic tiles and flooring',
        isActive: true
      },
      {
        materialCategory: 'wood',
        hsnCode: '4409',
        cgst: 6,
        sgst: 6,
        igst: 12,
        description: 'Wood and wooden products',
        isActive: true
      },
      {
        materialCategory: 'glass',
        hsnCode: '7003',
        cgst: 9,
        sgst: 9,
        igst: 18,
        description: 'Glass and glassware',
        isActive: true
      },
      {
        materialCategory: 'paints',
        hsnCode: '3208',
        cgst: 9,
        sgst: 9,
        igst: 18,
        description: 'Paints and varnishes',
        isActive: true
      },
      {
        materialCategory: 'hardware',
        hsnCode: '8302',
        cgst: 6,
        sgst: 6,
        igst: 12,
        description: 'Hardware fittings',
        isActive: true
      },
      {
        materialCategory: 'others',
        hsnCode: '9988',
        cgst: 9,
        sgst: 9,
        igst: 18,
        description: 'Other materials',
        isActive: true
      }
    ];

    await GSTCategory.insertMany(gstCategories);
    console.log(`✅ ${gstCategories.length} GST categories seeded successfully`);
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding GST categories:', error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

seedGST();