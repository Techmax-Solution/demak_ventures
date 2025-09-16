import express from 'express';
import {
    getAllAdmins,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    resetAdminPassword,
    getAdminStats
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected and require admin access
router.use(protect, admin);

// Admin management routes
router.get('/', getAllAdmins);
router.post('/', createAdmin);
router.put('/:id', updateAdmin);
router.delete('/:id', deleteAdmin);
router.post('/:id/reset-password', resetAdminPassword);
router.get('/stats', getAdminStats);

export default router;
