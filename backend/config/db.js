const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hostelsathi';
    console.log(`Connecting to MongoDB at: ${connUri}...`);
    
    const conn = await mongoose.connect(connUri);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`\n⚠️ MongoDB Connection Error: ${error.message}`);
    console.error(`👉 Please ensure MongoDB is running locally on port 27017, or specify a MONGODB_URI in your backend/.env file.\n`);
  }
};

module.exports = connectDB;
