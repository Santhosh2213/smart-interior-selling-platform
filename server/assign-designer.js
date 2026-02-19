const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const assignDesigner = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find designer
    const designer = await mongoose.connection.db.collection('designers').findOne({});
    console.log('Designer ID:', designer._id);

    // Find a pending project
    const project = await mongoose.connection.db.collection('projects').findOne({ 
      status: 'pending' 
    });
    
    if (project) {
      await mongoose.connection.db.collection('projects').updateOne(
        { _id: project._id },
        { 
          $set: { 
            designerId: designer._id,
            assignedDesigner: designer._id,
            designerReviewed: false
          } 
        }
      );
      console.log(`✅ Assigned project "${project.title}" to designer`);
    } else {
      console.log('❌ No pending projects found. Create one first.');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

assignDesigner();