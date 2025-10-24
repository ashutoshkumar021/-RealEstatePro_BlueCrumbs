const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection string
// const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bluecrumbs';
  const MONGODB_URI='mongodb+srv://n4navneetkumarmishra:DNu39TeftGe7RCkQ@cluster0.czaq4.mongodb.net/bluecrumbs?retryWrites=true&w=majority&appName=Cluster0'
// Log the database configuration (without showing full URI for security)
console.log('MongoDB Configuration:', {
  uri: MONGODB_URI.includes('@') 
    ? MONGODB_URI.split('@')[1] 
    : MONGODB_URI.replace(/mongodb:\/\//, ''),
  database: 'BluCrumb'
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});

module.exports = { connectDB, mongoose };
