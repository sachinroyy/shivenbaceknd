import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    console.log('\n🔍 Attempting to connect to MongoDB...');
    
    if (!process.env.MONGO_URI) {
      throw new Error('❌ MongoDB connection string is not defined in environment variables');
    }

    // Log connection details (with password hidden for security)
    const mongoUri = new URL(process.env.MONGO_URI);
    const safeUri = process.env.MONGO_URI.replace(/:[^:]*@/, ':***@');
    console.log('🌐 MongoDB Connection String:', safeUri);
    console.log(`🌐 Connecting to: ${mongoUri.protocol}//${mongoUri.hostname}${mongoUri.pathname.split('?')[0]}`);
    
    // Set up event listeners for connection status
    mongoose.connection.on('connecting', () => console.log('🔄 Connecting to MongoDB...'));
    mongoose.connection.on('connected', () => console.log('✅ Successfully connected to MongoDB'));
    mongoose.connection.on('error', (err) => console.error('❌ MongoDB connection error:', err));
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
    });
    
    console.log(`✅ MongoDB Connected Successfully!`);
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
    process.exit(1);
  }
};

export default connectDB;
