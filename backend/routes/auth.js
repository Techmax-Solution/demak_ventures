import express from 'express';
import {
    signup,
    login,
    getProfile,
    updateProfile,
    changePassword,
    verifyEmail,
    resendVerificationEmail
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.get('/verify', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);

// Protected routes
router.route('/profile')
    .get(protect, getProfile)
    .put(protect, updateProfile);

router.put('/change-password', protect, changePassword);

export default router;
