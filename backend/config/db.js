const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const autoSeedIfEmpty = require('../utils/autoSeed');

const connectDB = async () => {
  try {
    const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hostelsathi';
    console.log(`Connecting to MongoDB at: ${connUri}...`);
    
    // Fail fast if local MongoDB is not running
    const conn = await mongoose.connect(connUri, { serverSelectionTimeoutMS: 2000 });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await autoSeedIfEmpty();
  } catch (error) {
    console.warn(`\n⚠️ Local MongoDB not found (${error.message}). Starting In-Memory MongoDB as fallback...`);
    
    try {
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`✅ In-Memory MongoDB Connected: ${conn.connection.host}`);
      console.log(`⚠️ NOTE: Data will be lost when server restarts. Install MongoDB locally for persistence.`);
      await autoSeedIfEmpty();
    } catch (memError) {
      console.error(`\n❌ Failed to start In-Memory MongoDB: ${memError.message}`);
    }
  }
};

module.exports = connectDB;
