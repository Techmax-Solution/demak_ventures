import express from 'express';
import {
    getHeroImages,
    getAllHeroImages,
    getHeroImageById,
    createHeroImage,
    updateHeroImage,
    deleteHeroImage,
    updateHeroImageSortOrder,
    bulkUpdateSortOrder
} from '../controllers/heroController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getHeroImages);
router.get('/:id', getHeroImageById);

// Admin routes
router.get('/admin/all', protect, admin, getAllHeroImages);
router.post('/admin', protect, admin, createHeroImage);
router.put('/admin/:id', protect, admin, updateHeroImage);
router.delete('/admin/:id', protect, admin, deleteHeroImage);
router.put('/admin/:id/sort', protect, admin, updateHeroImageSortOrder);
router.put('/admin/sort', protect, admin, bulkUpdateSortOrder);

export default router;
