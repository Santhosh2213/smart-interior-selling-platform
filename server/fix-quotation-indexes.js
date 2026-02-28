const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function fixQuotationIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('quotations');

    // 1. Get all indexes
    const indexes = await collection.indexes();
    console.log('\n📊 Current indexes:');
    indexes.forEach(idx => {
      console.log(`  - ${idx.name}:`, JSON.stringify(idx.key));
    });

    // 2. Drop the problematic index on 'project'
    try {
      await collection.dropIndex('project_1');
      console.log('\n✅ Dropped index: project_1');
    } catch (err) {
      console.log('\n⚠️ Index project_1 not found, continuing...');
    }

    // 3. Drop any other indexes that might be on 'project'
    for (const idx of indexes) {
      if (idx.key && idx.key.project !== undefined) {
        try {
          await collection.dropIndex(idx.name);
          console.log(`✅ Dropped index: ${idx.name}`);
        } catch (err) {
          console.log(`⚠️ Could not drop ${idx.name}:`, err.message);
        }
      }
    }

    // 4. Clear all documents (optional - uncomment if needed)
    // const result = await collection.deleteMany({});
    // console.log(`\n✅ Cleared ${result.deletedCount} documents`);

    // 5. Create correct indexes
    try {
      await collection.createIndex({ quotationNumber: 1 }, { unique: true });
      console.log('✅ Created index: quotationNumber_1 (unique)');
    } catch (err) {
      console.log('⚠️ Could not create quotationNumber index:', err.message);
    }

    try {
      await collection.createIndex({ projectId: 1 });
      console.log('✅ Created index: projectId_1');
    } catch (err) {
      console.log('⚠️ Could not create projectId index:', err.message);
    }

    try {
      await collection.createIndex({ customerId: 1 });
      console.log('✅ Created index: customerId_1');
    } catch (err) {
      console.log('⚠️ Could not create customerId index:', err.message);
    }

    try {
      await collection.createIndex({ sellerId: 1 });
      console.log('✅ Created index: sellerId_1');
    } catch (err) {
      console.log('⚠️ Could not create sellerId index:', err.message);
    }

    try {
      await collection.createIndex({ status: 1 });
      console.log('✅ Created index: status_1');
    } catch (err) {
      console.log('⚠️ Could not create status index:', err.message);
    }

    try {
      await collection.createIndex({ createdAt: -1 });
      console.log('✅ Created index: createdAt_-1');
    } catch (err) {
      console.log('⚠️ Could not create createdAt index:', err.message);
    }

    // 6. Verify final indexes
    const finalIndexes = await collection.indexes();
    console.log('\n📊 Final indexes:');
    finalIndexes.forEach(idx => {
      console.log(`  - ${idx.name}:`, JSON.stringify(idx.key));
    });

    console.log('\n✅ Index fix completed successfully!');
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixQuotationIndexes();  