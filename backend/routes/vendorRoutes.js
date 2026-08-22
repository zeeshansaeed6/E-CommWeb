import express from 'express';
import {
  getVendorStats,
  getVendorProducts,
  getVendorPublicProfile,
} from '../controllers/vendorController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, restrictTo('Vendor', 'Admin'), getVendorStats);
router.get('/products', protect, restrictTo('Vendor', 'Admin'), getVendorProducts);
router.get('/:id', getVendorPublicProfile);

export default router;
