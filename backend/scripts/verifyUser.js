import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const verifyUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get email from command line argument
        const email = process.argv[2];
        
        if (!email) {
            console.log('❌ Please provide an email address');
            console.log('Usage: node scripts/verifyUser.js <email>');
            process.exit(1);
        }

        // Find user by email
        const user = await User.findOne({ email });
        
        if (!user) {
            console.log(`❌ User with email ${email} not found`);
            process.exit(1);
        }

        // Update user verification status
        user.isVerified = true;
        user.verificationToken = null;
        user.verificationTokenExpiry = null;
        await user.save();

        console.log(`✅ User ${email} has been verified successfully`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Verified: ${user.isVerified}`);
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

verifyUser();
