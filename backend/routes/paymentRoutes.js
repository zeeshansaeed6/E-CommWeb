import express from 'express';
import {
  createCheckoutSession,
  handleStripeWebhook,
  simulatePaymentSuccess,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Stripe Webhook Endpoint (Raw Body is handled in server.js before JSON bodyparser)
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Protected routes
router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/simulate-success', protect, simulatePaymentSuccess);

export default router;
