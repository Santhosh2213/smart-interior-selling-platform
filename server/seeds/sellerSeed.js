const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Seller = require('../models/Seller');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

// Debug: Check if MONGO_URI is loaded
console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ Found' : '❌ Not found');

const seedSeller = async () => {
  try {
    // Validate MONGO_URI
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in .env file');
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if seller already exists
    const existingSeller = await Seller.findOne();
    if (existingSeller) {
      console.log('⚠️ Seller already exists');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'seller@smartseller.com' });
    if (existingUser) {
      console.log('⚠️ Seller user already exists');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Create seller user
    const sellerUser = await User.create({
      name: 'Smart Seller',
      email: 'seller@smartseller.com',
      password: 'seller123',
      role: 'seller',
      phone: '9876543210',
      isEmailVerified: true,
      isPhoneVerified: true
    });

    console.log('✅ Seller user created');

    // Create seller profile
    const seller = await Seller.create({
      userId: sellerUser._id,
      businessName: 'Smart Seller Solutions',
      businessAddress: {
        addressLine1: '123 Business Park',
        addressLine2: 'Andheri East',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India'
      },
      gstin: '27AABCS1429B1Z5',
      pan: 'ABCDE1234F',
      bankDetails: {
        accountHolderName: 'Smart Seller Solutions',
        accountNumber: '1234567890',
        ifscCode: 'SBIN0001234',
        bankName: 'State Bank of India',
        branchName: 'Main Branch'
      },
      commissionRate: 5,
      status: 'active'
    });

    console.log('✅ Seller profile created successfully');
    console.log('\n📝 SEEDER COMPLETED:');
    console.log('------------------------');
    console.log('Email: seller@smartseller.com');
    console.log('Password: seller123');
    console.log('Business: Smart Seller Solutions');
    console.log('------------------------\n');
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding seller:', error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

seedSeller();