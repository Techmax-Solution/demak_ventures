import mongoose from 'mongoose';
import Order from './models/Order.js';
import User from './models/User.js';
import Product from './models/Product.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://richardasamoah284_db_user:iCLYf0BpwC57ZMdl@demak.ftlclgm.mongodb.net/clothing-store';
    console.log('🔗 Connecting to MongoDB...');
    console.log('📍 URI:', mongoURI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in log
    
    const conn = await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Connected:', conn.connection.host);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// Test Order Analytics
const testOrderAnalytics = async () => {
  try {
    console.log('\n🔍 Testing Order Analytics...');
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));
    
    console.log('📅 Date ranges:');
    console.log('  - Now:', now.toISOString());
    console.log('  - 30 days ago:', thirtyDaysAgo.toISOString());
    console.log('  - 60 days ago:', sixtyDaysAgo.toISOString());
    
    // Test basic order count first
    const totalOrders = await Order.countDocuments();
    console.log('📊 Total orders in database:', totalOrders);
    
    // Test current period aggregation
    console.log('\n🔍 Testing current period aggregation...');
    const currentPeriodData = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: { $cond: [{ $and: [{ $eq: ['$isPaid', true] }, { $ne: ['$status', 'cancelled'] }] }, '$totalPrice', 0] } },
          pendingOrders: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          processingOrders: { $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] } },
          shippedOrders: { $sum: { $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0] } },
          deliveredOrders: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
          cancelledOrders: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }
        }
      }
    ]);
    
    console.log('✅ Current period data:', currentPeriodData);
    
    // Test previous period aggregation
    console.log('\n🔍 Testing previous period aggregation...');
    const previousPeriodData = await Order.aggregate([
      { $match: { createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: { $cond: [{ $and: [{ $eq: ['$isPaid', true] }, { $ne: ['$status', 'cancelled'] }] }, '$totalPrice', 0] } },
          pendingOrders: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          processingOrders: { $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] } },
          shippedOrders: { $sum: { $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0] } },
          deliveredOrders: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
          cancelledOrders: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }
        }
      }
    ]);
    
    console.log('✅ Previous period data:', previousPeriodData);
    
    // Test monthly revenue
    console.log('\n🔍 Testing monthly revenue...');
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
    console.log('📅 Monthly date ranges:');
    console.log('  - Start of month:', startOfMonth.toISOString());
    console.log('  - Start of last month:', startOfLastMonth.toISOString());
    console.log('  - End of last month:', endOfLastMonth.toISOString());
    
    const currentMonthRevenue = await Order.aggregate([
      { 
        $match: { 
          isPaid: true, 
          status: { $ne: 'cancelled' },
          createdAt: { $gte: startOfMonth }
        } 
      },
      { $group: { _id: null, revenue: { $sum: '$totalPrice' } } }
    ]);
    
    console.log('✅ Current month revenue:', currentMonthRevenue);
    
    const lastMonthRevenue = await Order.aggregate([
      { 
        $match: { 
          isPaid: true, 
          status: { $ne: 'cancelled' },
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
        } 
      },
      { $group: { _id: null, revenue: { $sum: '$totalPrice' } } }
    ]);
    
    console.log('✅ Last month revenue:', lastMonthRevenue);
    
    console.log('\n✅ Order Analytics Test Completed Successfully!');
    
  } catch (error) {
    console.error('❌ Order Analytics Test Failed:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  }
};

// Test User Analytics
const testUserAnalytics = async () => {
  try {
    console.log('\n🔍 Testing User Analytics...');
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));
    
    // Test basic user count
    const totalUsers = await User.countDocuments();
    console.log('📊 Total users in database:', totalUsers);
    
    // Test current period aggregation
    const currentPeriodData = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
          inactiveUsers: { $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] } },
          adminUsers: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
          regularUsers: { $sum: { $cond: [{ $eq: ['$role', 'user'] }, 1, 0] } }
        }
      }
    ]);
    
    console.log('✅ User current period data:', currentPeriodData);
    
    console.log('\n✅ User Analytics Test Completed Successfully!');
    
  } catch (error) {
    console.error('❌ User Analytics Test Failed:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  }
};

// Test Product Analytics
const testProductAnalytics = async () => {
  try {
    console.log('\n🔍 Testing Product Analytics...');
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));
    
    // Test basic product count
    const totalProducts = await Product.countDocuments();
    console.log('📊 Total products in database:', totalProducts);
    
    // Test current period aggregation
    const currentPeriodData = await Product.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
          inactiveProducts: { $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] } },
          featuredProducts: { $sum: { $cond: [{ $eq: ['$featured', true] }, 1, 0] } },
          onSaleProducts: { $sum: { $cond: [{ $eq: ['$onSale', true] }, 1, 0] } },
          inStockProducts: { $sum: { $cond: [{ $gt: ['$totalStock', 0] }, 1, 0] } },
          outOfStockProducts: { $sum: { $cond: [{ $eq: ['$totalStock', 0] }, 1, 0] } }
        }
      }
    ]);
    
    console.log('✅ Product current period data:', currentPeriodData);
    
    console.log('\n✅ Product Analytics Test Completed Successfully!');
    
  } catch (error) {
    console.error('❌ Product Analytics Test Failed:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  }
};

// Main test function
const runTests = async () => {
  try {
    await connectDB();
    
    console.log('🚀 Starting Analytics Tests...\n');
    
    await testOrderAnalytics();
    await testUserAnalytics();
    await testProductAnalytics();
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the tests
runTests();
