import Order from '../models/Order.js';
import Product from '../models/Product.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
    try {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            couponCode,
            paymentResult,
            isPaid,
            paidAt
        } = req.body;

        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
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
        console.error(error);
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
            recentOrders
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
