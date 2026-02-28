const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function cleanAllIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('quotations');

    // 1. Get ALL indexes
    const indexes = await collection.indexes();
    console.log('\n📊 Current indexes:');
    indexes.forEach(idx => {
      console.log(`  - ${idx.name}:`, JSON.stringify(idx.key));
    });

    // 2. Drop ALL indexes except _id_
    for (const idx of indexes) {
      if (idx.name !== '_id_') {
        try {
          await collection.dropIndex(idx.name);
          console.log(`✅ Dropped index: ${idx.name}`);
        } catch (err) {
          console.log(`❌ Failed to drop ${idx.name}:`, err.message);
        }
      }
    }

    // 3. Clear the collection completely
    const deleteResult = await collection.deleteMany({});
    console.log(`\n✅ Cleared ${deleteResult.deletedCount} documents from quotations`);

    // 4. Create ONLY the indexes we want
    try {
      await collection.createIndex({ quotationNumber: 1 }, { unique: true });
      console.log('✅ Created index: quotationNumber_1 (unique)');
    } catch (err) {
      console.log('❌ Failed to create quotationNumber index:', err.message);
    }

    try {
      await collection.createIndex({ projectId: 1 });
      console.log('✅ Created index: projectId_1');
    } catch (err) {
      console.log('❌ Failed to create projectId index:', err.message);
    }

    try {
      await collection.createIndex({ customerId: 1 });
      console.log('✅ Created index: customerId_1');
    } catch (err) {
      console.log('❌ Failed to create customerId index:', err.message);
    }

    try {
      await collection.createIndex({ sellerId: 1 });
      console.log('✅ Created index: sellerId_1');
    } catch (err) {
      console.log('❌ Failed to create sellerId index:', err.message);
    }

    try {
      await collection.createIndex({ status: 1 });
      console.log('✅ Created index: status_1');
    } catch (err) {
      console.log('❌ Failed to create status index:', err.message);
    }

    try {
      await collection.createIndex({ createdAt: -1 });
      console.log('✅ Created index: createdAt_-1');
    } catch (err) {
      console.log('❌ Failed to create createdAt index:', err.message);
    }

    // 5. Verify final indexes
    const finalIndexes = await collection.indexes();
    console.log('\n📊 Final indexes:');
    finalIndexes.forEach(idx => {
      console.log(`  - ${idx.name}:`, JSON.stringify(idx.key));
    });

    console.log('\n✅ Database cleanup completed successfully!');
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

cleanAllIndexes();