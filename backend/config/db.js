import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/multivendor_ecommerce', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB] Error: ${error.message}`);
    // Non-fatal fallback for development so server still starts if mongo is offline
    console.warn('[MongoDB] Ensure MongoDB daemon is running locally or specify MONGO_URI in .env');
  }
};

export default connectDB;
