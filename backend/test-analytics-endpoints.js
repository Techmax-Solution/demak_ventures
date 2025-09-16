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
    
    const conn = await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Connected:', conn.connection.host);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// Test the exact same logic as in the analytics endpoints
const testOrderAnalyticsLogic = async () => {
  try {
    console.log('\n🔍 Testing Order Analytics Logic (exact same as endpoint)...');
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Current period data (last 30 days)
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

    // Previous period data (30-60 days ago)
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

    // Monthly revenue comparison
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

    const current = currentPeriodData[0] || {
      totalOrders: 0, totalRevenue: 0, pendingOrders: 0, 
      processingOrders: 0, shippedOrders: 0, deliveredOrders: 0, cancelledOrders: 0
    };

    const previous = previousPeriodData[0] || {
      totalOrders: 0, totalRevenue: 0, pendingOrders: 0, 
      processingOrders: 0, shippedOrders: 0, deliveredOrders: 0, cancelledOrders: 0
    };

    const currentMonthRev = currentMonthRevenue[0]?.revenue || 0;
    const lastMonthRev = lastMonthRevenue[0]?.revenue || 0;

    // Calculate percentage changes
    const calculatePercentageChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const result = {
      current: {
        totalOrders: current.totalOrders,
        totalRevenue: current.totalRevenue,
        pendingOrders: current.pendingOrders,
        processingOrders: current.processingOrders,
        shippedOrders: current.shippedOrders,
        deliveredOrders: current.deliveredOrders,
        cancelledOrders: current.cancelledOrders,
        monthlyRevenue: currentMonthRev
      },
      previous: {
        totalOrders: previous.totalOrders,
        totalRevenue: previous.totalRevenue,
        pendingOrders: previous.pendingOrders,
        processingOrders: previous.processingOrders,
        shippedOrders: previous.shippedOrders,
        deliveredOrders: previous.deliveredOrders,
        cancelledOrders: previous.cancelledOrders,
        monthlyRevenue: lastMonthRev
      },
      changes: {
        orders: calculatePercentageChange(current.totalOrders, previous.totalOrders),
        revenue: calculatePercentageChange(current.totalRevenue, previous.totalRevenue),
        monthlyRevenue: calculatePercentageChange(currentMonthRev, lastMonthRev),
        pending: calculatePercentageChange(current.pendingOrders, previous.pendingOrders),
        processing: calculatePercentageChange(current.processingOrders, previous.processingOrders),
        shipped: calculatePercentageChange(current.shippedOrders, previous.shippedOrders),
        delivered: calculatePercentageChange(current.deliveredOrders, previous.deliveredOrders),
        cancelled: calculatePercentageChange(current.cancelledOrders, previous.cancelledOrders)
      }
    };

    console.log('✅ Order Analytics Result:');
    console.log(JSON.stringify(result, null, 2));
    
    return result;
    
  } catch (error) {
    console.error('❌ Order Analytics Logic Test Failed:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};

// Main test function
const runTests = async () => {
  try {
    await connectDB();
    
    console.log('🚀 Testing Analytics Endpoint Logic...\n');
    
    await testOrderAnalyticsLogic();
    
    console.log('\n🎉 Analytics logic test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the tests
runTests();
