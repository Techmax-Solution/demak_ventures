import express from 'express';
import {
    createOrder,
    getOrderById,
    updateOrderToPaid,
    updateOrderToDelivered,
    getMyOrders,
    getOrders,
    updateOrderStatus,
    cancelOrder,
    getOrderStats,
    getDashboardAnalytics
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Admin routes (specific routes before parameterized ones)
router.get('/stats', protect, admin, getOrderStats);
router.get('/analytics', protect, admin, getDashboardAnalytics);
router.get('/', protect, admin, getOrders);

// Protected routes
router.post('/', protect, createOrder);
router.get('/myorders', protect, getMyOrders);
router.put('/:id/pay', protect, updateOrderToPaid);
router.put('/:id/cancel', protect, cancelOrder);
router.put('/:id/deliver', protect, admin, updateOrderToDelivered);
router.put('/:id/status', protect, admin, updateOrderStatus);

// Parameterized routes (must be last)
router.get('/:id', protect, getOrderById);

export default router;
