require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function checkUsers() {
  try {
    // Get MongoDB URI from environment variable
    const MONGO_URI = process.env.MONGO_URI;
    
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    console.log('URI:', MONGO_URI);
    
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB successfully');
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in database:', collections.map(c => c.name));
    
    // Find all users
    const users = await User.find({});
    console.log('Users found:', users.length);
    
    if (users.length > 0) {
      users.forEach(user => {
        console.log('User:', {
          userId: user.userId,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt
        });
      });
    } else {
      console.log('No users found in the database');
    }
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUsers(); 