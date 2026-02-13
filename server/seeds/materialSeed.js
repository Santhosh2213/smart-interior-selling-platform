const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Material = require('../models/Material');

// DEBUG: Check what units are allowed in the schema
const allowedUnits = Material.schema.path('unit').enumValues;
console.log('📋 Allowed units in Material model:', allowedUnits);

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

// Debug: Check if MONGO_URI is loaded
console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ Found' : '❌ Not found');

const seedMaterials = async () => {
  try {
    // Validate MONGO_URI
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in .env file');
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Material.deleteMany({});
    console.log('✅ Cleared existing materials');

    // Based on the error, 'pair' is not allowed
    // Let's use only units that are likely allowed
    const materials = [
      {
        name: 'Premium Ceramic Tiles - 2x2 ft',
        category: 'tiles',
        subcategory: 'ceramic',
        unit: 'sqft',
        pricePerUnit: 45,
        gstRate: 5,
        hsnCode: '6907',
        stock: 5000,
        minStockLevel: 500,
        supplier: 'TileCo',
        supplierContact: 'tiles@tileco.com',
        description: 'High quality ceramic tiles for flooring',
        images: [],
        isActive: true
      },
      {
        name: 'Vitrified Tiles - 2x4 ft',
        category: 'tiles',
        subcategory: 'vitrified',
        unit: 'sqft',
        pricePerUnit: 75,
        gstRate: 5,
        hsnCode: '6907',
        stock: 3500,
        minStockLevel: 350,
        supplier: 'TileCo',
        supplierContact: 'tiles@tileco.com',
        description: 'Premium vitrified tiles with glossy finish',
        images: [],
        isActive: true
      },
      {
        name: 'Teak Wood - Grade A',
        category: 'wood',
        subcategory: 'teak',
        unit: 'sqft',
        pricePerUnit: 250,
        gstRate: 12,
        hsnCode: '4409',
        stock: 1000,
        minStockLevel: 100,
        supplier: 'WoodCraft',
        supplierContact: 'sales@woodcraft.com',
        description: 'Premium teak wood for furniture',
        images: [],
        isActive: true
      },
      {
        name: 'Plywood - 18mm',
        category: 'wood',
        subcategory: 'plywood',
        unit: 'sqft', // Changed from 'piece' to 'sqft'
        pricePerUnit: 65, // Adjusted price per sqft (1200 for a full sheet ~= 65 per sqft)
        gstRate: 12,
        hsnCode: '4409',
        stock: 5000, // Now in sqft
        minStockLevel: 500,
        supplier: 'WoodCraft',
        supplierContact: 'sales@woodcraft.com',
        description: 'Waterproof plywood for furniture (18mm thickness)',
        images: [],
        isActive: true
      },
      {
        name: 'Tempered Glass - 8mm',
        category: 'glass',
        subcategory: 'tempered',
        unit: 'sqft',
        pricePerUnit: 180,
        gstRate: 18,
        hsnCode: '7003',
        stock: 2000,
        minStockLevel: 200,
        supplier: 'GlassHouse',
        supplierContact: 'info@glasshouse.com',
        description: 'Safety tempered glass for doors and windows',
        images: [],
        isActive: true
      },
      {
        name: 'Float Glass - 5mm',
        category: 'glass',
        subcategory: 'float',
        unit: 'sqft',
        pricePerUnit: 95,
        gstRate: 18,
        hsnCode: '7003',
        stock: 3000,
        minStockLevel: 300,
        supplier: 'GlassHouse',
        supplierContact: 'info@glasshouse.com',
        description: 'Standard float glass for windows',
        images: [],
        isActive: true
      },
      {
        name: 'Asian Paints - Royale Shyne',
        category: 'paints',
        subcategory: 'emulsion',
        unit: 'liter',
        pricePerUnit: 550,
        gstRate: 18,
        hsnCode: '3208',
        stock: 300,
        minStockLevel: 30,
        supplier: 'Asian Paints',
        supplierContact: 'orders@asianpaints.com',
        description: 'Luxury emulsion paint with shine finish',
        images: [],
        isActive: true
      },
      {
        name: 'Premium Door Handle Set',
        category: 'hardware',
        subcategory: 'handles',
        unit: 'piece', // Changed from 'piece' (already valid)
        pricePerUnit: 350,
        gstRate: 12,
        hsnCode: '8302',
        stock: 500,
        minStockLevel: 50,
        supplier: 'HardwareMart',
        supplierContact: 'sales@hardwaremart.com',
        description: 'Stainless steel door handles',
        images: [],
        isActive: true
      },
      {
        name: 'Brass Hinges - 4 inch',
        category: 'hardware',
        subcategory: 'hinges',
        unit: 'piece', // Changed from 'pair' to 'piece'
        pricePerUnit: 60, // Adjusted price per piece (was 120 per pair)
        gstRate: 12,
        hsnCode: '8302',
        stock: 2000,
        minStockLevel: 200,
        supplier: 'HardwareMart',
        supplierContact: 'sales@hardwaremart.com',
        description: 'Premium brass hinges for doors (sold individually)',
        images: [],
        isActive: true
      }
    ];

    await Material.insertMany(materials);
    console.log(`✅ ${materials.length} materials seeded successfully`);
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding materials:', error.message);
    if (error.name === 'ValidationError') {
      console.error('Validation errors:');
      for (let field in error.errors) {
        console.error(`  - ${field}: ${error.errors[field].message}`);
      }
    }
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

seedMaterials();