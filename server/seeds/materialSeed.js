const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Material = require('../models/Material');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Debug: Check MONGO_URI
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

    // Check what units are allowed in the schema
    const allowedUnits = Material.schema.path('unit').enumValues;
    console.log('📋 Allowed units in Material model:', allowedUnits);

    // Clear existing data
    await Material.deleteMany({});
    console.log('✅ Cleared existing materials');

    // Materials with only allowed units (sqft, sqm, piece, box, liter, kg)
    const materials = [
      // ========== TILES (sqft) ==========
      {
        name: 'Premium Ceramic Tiles - 2x2 ft',
        category: 'tiles',
        subcategory: 'ceramic',
        unit: 'sqft',
        pricePerUnit: 45,
        gstRate: 5,
        hsnCode: '6907',
        stock: 5000,
        supplier: 'Kajaria Ceramics',
        description: 'Premium ceramic floor tiles, anti-skid finish'
      },
      {
        name: 'Ceramic Wall Tiles - 1x2 ft',
        category: 'tiles',
        subcategory: 'ceramic',
        unit: 'sqft',
        pricePerUnit: 38,
        gstRate: 5,
        hsnCode: '6907',
        stock: 6000,
        supplier: 'Somany Ceramics',
        description: 'Decorative wall tiles with glossy finish'
      },
      {
        name: 'Vitrified Floor Tiles - 2x4 ft',
        category: 'tiles',
        subcategory: 'vitrified',
        unit: 'sqft',
        pricePerUnit: 65,
        gstRate: 5,
        hsnCode: '6907',
        stock: 4000,
        supplier: 'Orient Bell',
        description: 'Double charge vitrified tiles'
      },
      {
        name: 'Porcelain Tiles - 2x2 ft',
        category: 'tiles',
        subcategory: 'porcelain',
        unit: 'sqft',
        pricePerUnit: 85,
        gstRate: 5,
        hsnCode: '6907',
        stock: 3500,
        supplier: 'RAK Ceramics',
        description: 'Premium porcelain tiles with wood finish'
      },
      {
        name: 'Marble Tiles - Makrana',
        category: 'tiles',
        subcategory: 'marble',
        unit: 'sqft',
        pricePerUnit: 180,
        gstRate: 5,
        hsnCode: '6802',
        stock: 1500,
        supplier: 'RK Marble',
        description: 'Premium Makrana marble tiles'
      },
      
      // ========== TILES in sqm (for metric customers) ==========
      {
        name: 'Premium Ceramic Tiles - 60x60 cm',
        category: 'tiles',
        subcategory: 'ceramic',
        unit: 'sqm',
        pricePerUnit: 485, // ~₹45 per sqft * 10.764 = ₹484/sq m
        gstRate: 5,
        hsnCode: '6907',
        stock: 500,
        supplier: 'Kajaria Ceramics',
        description: 'Premium ceramic floor tiles (metric)'
      },
      {
        name: 'Vitrified Tiles - 60x120 cm',
        category: 'tiles',
        subcategory: 'vitrified',
        unit: 'sqm',
        pricePerUnit: 700, // ~₹65 per sqft * 10.764 = ₹700/sq m
        gstRate: 5,
        hsnCode: '6907',
        stock: 400,
        supplier: 'Orient Bell',
        description: 'Double charge vitrified tiles (metric)'
      },
      
      // ========== WOOD (using sqft) ==========
      {
        name: 'Teak Wood - Grade A',
        category: 'wood',
        subcategory: 'teak',
        unit: 'sqft',
        pricePerUnit: 180,
        gstRate: 12,
        hsnCode: '4409',
        stock: 5000,
        supplier: 'Timber World',
        description: 'Premium teak wood for furniture (per sqft)'
      },
      {
        name: 'Plywood - 18mm (Marine Grade)',
        category: 'wood',
        subcategory: 'plywood',
        unit: 'sqft',
        pricePerUnit: 75,
        gstRate: 12,
        hsnCode: '4412',
        stock: 6400,
        supplier: 'Century Ply',
        description: 'Marine grade plywood, waterproof (per sqft)'
      },
      {
        name: 'Plywood - 12mm (Commercial Grade)',
        category: 'wood',
        subcategory: 'plywood',
        unit: 'sqft',
        pricePerUnit: 50,
        gstRate: 12,
        hsnCode: '4412',
        stock: 8000,
        supplier: 'Greenply',
        description: 'Commercial plywood for furniture (per sqft)'
      },
      {
        name: 'MDF Board - 18mm',
        category: 'wood',
        subcategory: 'mdf',
        unit: 'sqft',
        pricePerUnit: 60,
        gstRate: 12,
        hsnCode: '4411',
        stock: 4800,
        supplier: 'Rushil Decor',
        description: 'Medium density fiberboard (per sqft)'
      },
      {
        name: 'Block Board - 19mm',
        category: 'wood',
        subcategory: 'blockboard',
        unit: 'sqft',
        pricePerUnit: 100,
        gstRate: 12,
        hsnCode: '4412',
        stock: 3000,
        supplier: 'Kitply',
        description: 'Premium blockboard for furniture (per sqft)'
      },
      
      // ========== WOOD in sqm ==========
      {
        name: 'Teak Wood - Grade A (Metric)',
        category: 'wood',
        subcategory: 'teak',
        unit: 'sqm',
        pricePerUnit: 1940, // ~₹180 per sqft * 10.764 = ₹1938/sq m
        gstRate: 12,
        hsnCode: '4409',
        stock: 500,
        supplier: 'Timber World',
        description: 'Premium teak wood for furniture (per sqm)'
      },
      
      // ========== GLASS (sqft) ==========
      {
        name: 'Clear Float Glass - 5mm',
        category: 'glass',
        subcategory: 'float',
        unit: 'sqft',
        pricePerUnit: 55,
        gstRate: 18,
        hsnCode: '7003',
        stock: 4500,
        supplier: 'Asahi India',
        description: 'Clear float glass for windows'
      },
      {
        name: 'Clear Float Glass - 8mm',
        category: 'glass',
        subcategory: 'float',
        unit: 'sqft',
        pricePerUnit: 85,
        gstRate: 18,
        hsnCode: '7003',
        stock: 3500,
        supplier: 'Saint Gobain',
        description: 'Thick clear glass for doors'
      },
      {
        name: 'Toughened Glass - 10mm',
        category: 'glass',
        subcategory: 'toughened',
        unit: 'sqft',
        pricePerUnit: 180,
        gstRate: 18,
        hsnCode: '7007',
        stock: 2500,
        supplier: 'Gold Plus',
        description: 'Safety tempered glass for railings'
      },
      {
        name: 'Mirror Glass - 4mm',
        category: 'glass',
        subcategory: 'mirror',
        unit: 'sqft',
        pricePerUnit: 75,
        gstRate: 18,
        hsnCode: '7009',
        stock: 4000,
        supplier: 'Asahi India',
        description: 'Standard silver mirror'
      },
      {
        name: 'Laminated Glass - 8.38mm',
        category: 'glass',
        subcategory: 'laminated',
        unit: 'sqft',
        pricePerUnit: 195,
        gstRate: 18,
        hsnCode: '7007',
        stock: 1800,
        supplier: 'Saint Gobain',
        description: 'Safety glass with PVB interlayer'
      },
      
      // ========== GLASS in sqm ==========
      {
        name: 'Clear Float Glass - 5mm (Metric)',
        category: 'glass',
        subcategory: 'float',
        unit: 'sqm',
        pricePerUnit: 590, // ~₹55 per sqft * 10.764 = ₹592/sq m
        gstRate: 18,
        hsnCode: '7003',
        stock: 400,
        supplier: 'Asahi India',
        description: 'Clear float glass for windows (per sqm)'
      },
      
      // ========== PAINTS (liter) ==========
      {
        name: 'Asian Paints - Royale Shyne Emulsion',
        category: 'paints',
        subcategory: 'emulsion',
        unit: 'liter',
        pricePerUnit: 550,
        gstRate: 18,
        hsnCode: '3208',
        stock: 500,
        supplier: 'Asian Paints',
        description: 'Premium emulsion paint with sheen finish'
      },
      {
        name: 'Asian Paints - Apcolite Premium Emulsion',
        category: 'paints',
        subcategory: 'emulsion',
        unit: 'liter',
        pricePerUnit: 380,
        gstRate: 18,
        hsnCode: '3208',
        stock: 600,
        supplier: 'Asian Paints',
        description: 'Economy emulsion for walls'
      },
      {
        name: 'Asian Paints - Tractor Shine Enamel',
        category: 'paints',
        subcategory: 'enamel',
        unit: 'liter',
        pricePerUnit: 420,
        gstRate: 18,
        hsnCode: '3208',
        stock: 450,
        supplier: 'Asian Paints',
        description: 'High gloss enamel for wood and metal'
      },
      {
        name: 'Asian Paints - Apex Ultima Exterior',
        category: 'paints',
        subcategory: 'exterior',
        unit: 'liter',
        pricePerUnit: 520,
        gstRate: 18,
        hsnCode: '3208',
        stock: 500,
        supplier: 'Asian Paints',
        description: 'Premium exterior emulsion'
      },
      {
        name: 'Nerolac - Excel Emulsion',
        category: 'paints',
        subcategory: 'emulsion',
        unit: 'liter',
        pricePerUnit: 350,
        gstRate: 18,
        hsnCode: '3208',
        stock: 600,
        supplier: 'Nerolac',
        description: 'Economy interior emulsion'
      },
      
      // ========== PAINTS in kg (for putty) ==========
      {
        name: 'Wall Putty - 20kg Bag',
        category: 'paints',
        subcategory: 'putty',
        unit: 'kg',
        pricePerUnit: 28, // ₹550 per 20kg bag = ₹27.5/kg
        gstRate: 18,
        hsnCode: '3214',
        stock: 6000,
        supplier: 'Birla White',
        description: 'White cement based wall putty (per kg)'
      },
      
      // ========== HARDWARE (piece) ==========
      {
        name: 'Premium Door Handle Set - SS',
        category: 'hardware',
        subcategory: 'handles',
        unit: 'piece',
        pricePerUnit: 450,
        gstRate: 12,
        hsnCode: '8302',
        stock: 500,
        supplier: 'Hettich',
        description: 'Stainless steel door handle set'
      },
      {
        name: 'Door Lock - Mortise Lock',
        category: 'hardware',
        subcategory: 'locks',
        unit: 'piece',
        pricePerUnit: 650,
        gstRate: 12,
        hsnCode: '8301',
        stock: 400,
        supplier: 'Godrej',
        description: 'Premium mortise lock for main doors'
      },
      {
        name: 'Door Hinge - 4 inch',
        category: 'hardware',
        subcategory: 'hinges',
        unit: 'piece',
        pricePerUnit: 85,
        gstRate: 12,
        hsnCode: '8302',
        stock: 1000,
        supplier: 'Hettich',
        description: 'Standard door hinge (sold individually)'
      },
      {
        name: 'Concealed Hinge - Kitchen Cabinet',
        category: 'hardware',
        subcategory: 'hinges',
        unit: 'piece',
        pricePerUnit: 120,
        gstRate: 12,
        hsnCode: '8302',
        stock: 1200,
        supplier: 'Hettich',
        description: 'Concealed hinge for cabinets'
      },
      {
        name: 'Drawer Slide - 18 inch',
        category: 'hardware',
        subcategory: 'slides',
        unit: 'piece',
        pricePerUnit: 140,
        gstRate: 12,
        hsnCode: '8302',
        stock: 1000,
        supplier: 'Hafele',
        description: 'Ball bearing drawer slide (sold individually)'
      },
      
      // ========== HARDWARE in box (for screws/nails) ==========
      {
        name: 'Wood Screws - Assorted Pack',
        category: 'hardware',
        subcategory: 'fasteners',
        unit: 'box',
        pricePerUnit: 250,
        gstRate: 12,
        hsnCode: '7318',
        stock: 200,
        supplier: 'HardwareMart',
        description: 'Assorted wood screws (100 pieces per box)'
      },
      
      // ========== OTHERS (piece, kg, box) ==========
      {
        name: 'PVC Pipe - 4 inch (10 ft)',
        category: 'others',
        subcategory: 'plumbing',
        unit: 'piece',
        pricePerUnit: 450,
        gstRate: 18,
        hsnCode: '3917',
        stock: 500,
        supplier: 'Supreme',
        description: 'PVC pipe for plumbing (10 ft length)'
      },
      {
        name: 'Sanitaryware - Wash Basin',
        category: 'others',
        subcategory: 'sanitaryware',
        unit: 'piece',
        pricePerUnit: 2500,
        gstRate: 18,
        hsnCode: '6910',
        stock: 100,
        supplier: 'Cera',
        description: 'Vitreous china wash basin'
      },
      {
        name: 'Faucet - Basin Mixer',
        category: 'others',
        subcategory: 'faucets',
        unit: 'piece',
        pricePerUnit: 1200,
        gstRate: 18,
        hsnCode: '8481',
        stock: 200,
        supplier: 'Jaguar',
        description: 'Single lever basin mixer'
      },
      {
        name: 'PVC Wire - 1.5 sq mm',
        category: 'others',
        subcategory: 'electrical',
        unit: 'box', // Changed from 'meter' to 'box'
        pricePerUnit: 1200, // ₹12 per meter * 100 meters = ₹1200
        gstRate: 18,
        hsnCode: '8544',
        stock: 100,
        supplier: 'Polycab',
        description: 'PVC insulated wire for lighting (100m box)'
      },
      {
        name: 'LED Panel Light - 12W',
        category: 'others',
        subcategory: 'lighting',
        unit: 'piece',
        pricePerUnit: 450,
        gstRate: 18,
        hsnCode: '9405',
        stock: 400,
        supplier: 'Philips',
        description: 'Round LED panel light'
      },
      {
        name: 'Cement - 50kg',
        category: 'others',
        subcategory: 'construction',
        unit: 'kg', // Changed from 'bag' to 'kg'
        pricePerUnit: 7.6, // ₹380 per 50kg bag = ₹7.6 per kg
        gstRate: 28,
        hsnCode: '2523',
        stock: 50000,
        supplier: 'Ultratech',
        description: 'Ordinary Portland cement 53 grade (per kg)'
      },
      {
        name: 'Steel TMT Bar - 10mm',
        category: 'others',
        subcategory: 'construction',
        unit: 'kg',
        pricePerUnit: 65,
        gstRate: 18,
        hsnCode: '7214',
        stock: 5000,
        supplier: 'Tata Steel',
        description: 'TMT reinforcement bar (per kg)'
      },
      {
        name: 'Adhesive - Fevicol SR',
        category: 'others',
        subcategory: 'adhesive',
        unit: 'kg',
        pricePerUnit: 280,
        gstRate: 18,
        hsnCode: '3506',
        stock: 500,
        supplier: 'Pidilite',
        description: 'Synthetic resin adhesive for wood (per kg)'
      }
    ];

    // Insert materials
    const result = await Material.insertMany(materials);
    console.log(`✅ ${result.length} materials seeded successfully`);

    // Group by category for summary
    const categorySummary = result.reduce((acc, material) => {
      acc[material.category] = (acc[material.category] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📊 Materials Summary by Category:');
    Object.entries(categorySummary).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} materials`);
    });

    // Group by unit for summary
    const unitSummary = result.reduce((acc, material) => {
      acc[material.unit] = (acc[material.unit] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📊 Materials Summary by Unit:');
    Object.entries(unitSummary).forEach(([unit, count]) => {
      console.log(`   ${unit}: ${count} materials`);
    });

    // Show sample materials
    console.log('\n📝 Sample Materials:');
    const samples = result.slice(0, 5);
    samples.forEach(m => {
      console.log(`   - ${m.name} (${m.category}): ₹${m.pricePerUnit}/${m.unit}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding materials:', error.message);
    
    if (error.name === 'ValidationError') {
      console.error('Validation errors:');
      for (let field in error.errors) {
        console.error(`  - ${field}: ${error.errors[field].message}`);
        console.error(`    Value: ${error.errors[field].value}`);
      }
    }
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

seedMaterials();