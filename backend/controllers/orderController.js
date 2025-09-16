import Order from '../models/Order.js';
import Product from '../models/Product.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
    try {
        console.log('Creating order with data:', JSON.stringify(req.body, null, 2));
        
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            couponCode,
            paymentResult,
            isPaid,
            paidAt
        } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        // Validate required fields
        if (!shippingAddress) {
            return res.status(400).json({ message: 'Shipping address is required' });
        }

        if (!paymentMethod) {
            return res.status(400).json({ message: 'Payment method is required' });
        }

        // Validate shipping address fields
        const requiredShippingFields = ['firstName', 'lastName', 'email', 'phone', 'street', 'city', 'state', 'zipCode'];
        for (const field of requiredShippingFields) {
            if (!shippingAddress[field]) {
                return res.status(400).json({ message: `Shipping address ${field} is required` });
            }
        }

        // Validate order items
        for (let i = 0; i < orderItems.length; i++) {
            const item = orderItems[i];
            const requiredItemFields = ['product', 'name', 'image', 'price', 'quantity', 'size', 'color'];
            for (const field of requiredItemFields) {
                if (!item[field]) {
                    return res.status(400).json({ message: `Order item ${i + 1} ${field} is required` });
                }
            }
        }

        // Verify products exist and have sufficient stock
        for (let item of orderItems) {
            const product = await Product.findById(item.product);
            if (!product || !product.isActive) {
                return res.status(404).json({ message: `Product ${item.name} not found` });
            }

            // Check stock availability
            const sizeInfo = product.sizes.find(s => s.size === item.size);
            if (!sizeInfo || sizeInfo.quantity < item.quantity) {
                return res.status(400).json({ 
                    message: `Insufficient stock for ${item.name} in size ${item.size}` 
                });
            }
        }

        const order = new Order({
            orderItems,
            user: req.user._id,
            shippingAddress,
            paymentMethod,
            couponCode,
            paymentResult,
            isPaid: isPaid || false,
            paidAt: paidAt || null
        });

        const createdOrder = await order.save();

        // Update stock based on payment status
        if (paymentMethod !== 'Paystack' || isPaid) {
            // Update product stock for non-Paystack payments or already-paid Paystack orders
            for (let item of orderItems) {
                const product = await Product.findById(item.product);
                if (product) {
                    const sizeIndex = product.sizes.findIndex(s => s.size === item.size);
                    if (sizeIndex !== -1) {
                        product.sizes[sizeIndex].quantity -= item.quantity;
                        await product.save();
                    }
                }
            }
        }

        res.status(201).json(createdOrder);
    } catch (error) {
        console.error('Order creation error:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            errors: error.errors,
            code: error.code
        });
        res.status(400).json({ message: 'Invalid order data', error: error.message });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('orderItems.product', 'name images');

        if (order) {
            // Check if user owns the order or is admin
            if (order.user._id.toString() === req.user._id.toString() || req.user.role === 'admin') {
                res.json(order);
            } else {
                res.status(403).json({ message: 'Not authorized to view this order' });
            }
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            // Check if user owns the order or is admin
            if (order.user.toString() === req.user._id.toString() || req.user.role === 'admin') {
                await order.markAsPaid(req.body);
                const updatedOrder = await order.save();
                res.json(updatedOrder);
            } else {
                res.status(403).json({ message: 'Not authorized to update this order' });
            }
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
export const updateOrderToDelivered = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.markAsDelivered(req.body.trackingNumber);
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        let query = { user: req.user._id };

        // Filter by status
        if (req.query.status) {
            query.status = req.query.status;
        }

        const total = await Order.countDocuments(query);
        const orders = await Order.find(query)
            .populate('orderItems.product', 'name images')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            orders,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalOrders: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        let query = {};

        // Filter by status
        if (req.query.status) {
            query.status = req.query.status;
        }

        // Filter by payment status
        if (req.query.isPaid !== undefined) {
            query.isPaid = req.query.isPaid === 'true';
        }

        // Filter by delivery status
        if (req.query.isDelivered !== undefined) {
            query.isDelivered = req.query.isDelivered === 'true';
        }

        // Date range filter
        if (req.query.startDate || req.query.endDate) {
            query.createdAt = {};
            if (req.query.startDate) {
                query.createdAt.$gte = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                query.createdAt.$lte = new Date(req.query.endDate);
            }
        }

        const total = await Order.countDocuments(query);
        const orders = await Order.find(query)
            .populate('user', 'name email')
            .populate('orderItems.product', 'name images')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            orders,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalOrders: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
    try {
        const { status, trackingNumber, notes } = req.body;
        const order = await Order.findById(req.params.id);

        if (order) {
            order.status = status;
            if (trackingNumber) order.trackingNumber = trackingNumber;
            if (notes) order.notes = notes;

            // Update delivery status if status is delivered
            if (status === 'delivered') {
                order.markAsDelivered(trackingNumber);
            }

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Invalid order data' });
    }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            // Check if user owns the order or is admin
            if (order.user.toString() === req.user._id.toString() || req.user.role === 'admin') {
                // Only allow cancellation if order is pending or processing
                if (['pending', 'processing'].includes(order.status)) {
                    order.status = 'cancelled';

                    // Restore product stock
                    for (let item of order.orderItems) {
                        const product = await Product.findById(item.product);
                        if (product) {
                            const sizeIndex = product.sizes.findIndex(s => s.size === item.size);
                            if (sizeIndex !== -1) {
                                product.sizes[sizeIndex].quantity += item.quantity;
                                await product.save();
                            }
                        }
                    }

                    const updatedOrder = await order.save();
                    res.json(updatedOrder);
                } else {
                    res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
                }
            } else {
                res.status(403).json({ message: 'Not authorized to cancel this order' });
            }
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private/Admin
export const getOrderStats = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'pending' });
        const processingOrders = await Order.countDocuments({ status: 'processing' });
        const shippedOrders = await Order.countDocuments({ status: 'shipped' });
        const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
        const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

        // Calculate total revenue
        const revenueResult = await Order.aggregate([
            { $match: { isPaid: true, status: { $ne: 'cancelled' } } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
        ]);
        const totalRevenue = revenueResult[0]?.totalRevenue || 0;

        // Calculate monthly revenue (current month)
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthlyRevenueResult = await Order.aggregate([
            { 
                $match: { 
                    isPaid: true, 
                    status: { $ne: 'cancelled' },
                    createdAt: { $gte: startOfMonth }
                } 
            },
            { $group: { _id: null, monthlyRevenue: { $sum: '$totalPrice' } } }
        ]);
        const monthlyRevenue = monthlyRevenueResult[0]?.monthlyRevenue || 0;

        // Get orders from last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentOrders = await Order.countDocuments({ 
            createdAt: { $gte: thirtyDaysAgo } 
        });

        res.json({
            totalOrders,
            pendingOrders,
            processingOrders,
            shippedOrders,
            deliveredOrders,
            cancelledOrders,
            totalRevenue,
            monthlyRevenue,
            recentOrders
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get dashboard analytics data
// @route   GET /api/orders/analytics
// @access  Private/Admin
export const getDashboardAnalytics = async (req, res) => {
    try {
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

        // Calculate daily changes (today vs yesterday)
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        // Get today's data
        const todayData = await Order.aggregate([
            { $match: { createdAt: { $gte: today } } },
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

        // Get yesterday's data
        const yesterdayData = await Order.aggregate([
            { $match: { createdAt: { $gte: yesterday, $lt: today } } },
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

        const todayStats = todayData[0] || {
            totalOrders: 0, totalRevenue: 0, pendingOrders: 0, 
            processingOrders: 0, shippedOrders: 0, deliveredOrders: 0, cancelledOrders: 0
        };

        const yesterdayStats = yesterdayData[0] || {
            totalOrders: 0, totalRevenue: 0, pendingOrders: 0, 
            processingOrders: 0, shippedOrders: 0, deliveredOrders: 0, cancelledOrders: 0
        };

        res.json({
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
            dailyChanges: {
                orders: todayStats.totalOrders - yesterdayStats.totalOrders,
                revenue: todayStats.totalRevenue - yesterdayStats.totalRevenue,
                pending: todayStats.pendingOrders - yesterdayStats.pendingOrders,
                processing: todayStats.processingOrders - yesterdayStats.processingOrders,
                shipped: todayStats.shippedOrders - yesterdayStats.shippedOrders,
                delivered: todayStats.deliveredOrders - yesterdayStats.deliveredOrders,
                cancelled: todayStats.cancelledOrders - yesterdayStats.cancelledOrders
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
