import express from 'express';
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    createProductReview,
    getTopProducts,
    getNewestProducts,
    getProductFilters,
    updateProductStock,
    getProductAnalytics
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/top', getTopProducts);
router.get('/newest', getNewestProducts);
router.get('/filters', getProductFilters);

// Admin routes (specific routes before parameterized ones)
router.get('/analytics', protect, admin, getProductAnalytics);
router.post('/', protect, admin, createProduct);

// Protected routes
router.post('/:id/reviews', protect, createProductReview);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.put('/:id/stock', protect, admin, updateProductStock);

// Parameterized routes (must be last)
router.get('/:id', getProductById);

export default router;
