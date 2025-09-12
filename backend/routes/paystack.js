import express from 'express';
import { 
    initializePayment, 
    verifyPayment, 
    handleWebhook 
} from '../controllers/paystackController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Initialize payment
router.post('/initialize', protect, initializePayment);

// Verify payment
router.post('/verify', protect, verifyPayment);

// Webhook endpoint (no auth required, but signature verified)
router.post('/webhook', handleWebhook);

export default router;
