const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Quotation = require('./models/Quotation');

dotenv.config();

const testQuotation = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Create a test quotation without quotationNumber
    const testQuot = new Quotation({
      projectId: new mongoose.Types.ObjectId(),
      customerId: new mongoose.Types.ObjectId(),
      sellerId: new mongoose.Types.ObjectId(),
      items: [],
      subtotal: 0,
      gstTotal: 0,
      total: 0
    });

    await testQuot.save();
    console.log('✅ Test quotation created with number:', testQuot.quotationNumber);

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

testQuotation();