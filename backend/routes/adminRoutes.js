import express from 'express';
import {
  getAdminStats,
  getAllUsers,
  updateVendorConfig,
  markVendorPayoutPaid,
} from '../controllers/adminController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes restricted to Admin role
router.use(protect, restrictTo('Admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.patch('/vendors/:id', updateVendorConfig);
router.patch('/orders/:orderId/payouts/:vendorId', markVendorPayoutPaid);

export default router;
