import mongoose from 'mongoose';

// Setup connection lifecycle event handlers
mongoose.connection.on('connected', () => {
  console.log(`✓ MongoDB connection established: ${mongoose.connection.host}/${mongoose.connection.name}`);
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB Runtime Connection Error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected from server');
});

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('❌ MONGO_URI is not defined in your .env file!');
    return null;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✓ MongoDB Connected Successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
      console.error('💡 Hint: Check database username and password in MONGO_URI.');
    } else if (error.message.includes('queryTxt ETIMEOUT') || error.message.includes('getaddrinfo ENOTFOUND')) {
      console.error('💡 Hint: Check network connection, DNS, or MongoDB Atlas cluster hostname.');
    } else if (error.message.includes('not allowed to connect') || error.message.includes('whitelist')) {
      console.error('💡 Hint: Ensure your current IP address is whitelisted in MongoDB Atlas Network Access (e.g. 0.0.0.0/0).');
    }
    return null;
  }
};

export default connectDB;
