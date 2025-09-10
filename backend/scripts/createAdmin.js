import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const createAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find user by email and update to admin
        const adminEmail = 'admin@example.com';
        
        const user = await User.findOne({ email: adminEmail });
        
        if (user) {
            user.role = 'admin';
            await user.save();
            console.log(`✅ User ${adminEmail} has been made an admin`);
        } else {
            console.log(`❌ User ${adminEmail} not found`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createAdmin();
