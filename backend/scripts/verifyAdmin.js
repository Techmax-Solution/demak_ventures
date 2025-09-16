import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const verifyAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find admin users and set verification to true
        const adminUsers = await User.find({ role: 'admin' });
        
        if (adminUsers.length === 0) {
            console.log('❌ No admin users found');
            process.exit(0);
        }

        for (const admin of adminUsers) {
            admin.isVerified = true;
            admin.verificationToken = null;
            admin.verificationTokenExpiry = null;
            await admin.save();
            console.log(`✅ Admin ${admin.email} has been verified`);
        }

        console.log(`\n🎉 Successfully verified ${adminUsers.length} admin user(s)`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

verifyAdmin();
