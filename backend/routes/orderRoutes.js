import express from 'express';
import {
  createOrder,
  getOrderById,
  getMyOrders,
  getVendorOrders,
  updateVendorItemFulfillment,
  getAllOrdersAdmin,
} from '../controllers/orderController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createOrder);
router.route('/my-orders').get(protect, getMyOrders);
router.route('/vendor-orders').get(protect, restrictTo('Vendor', 'Admin'), getVendorOrders);
router.route('/admin/all').get(protect, restrictTo('Admin'), getAllOrdersAdmin);

router.route('/:id').get(protect, getOrderById);

router
  .route('/:orderId/items/:itemId/fulfillment')
  .patch(protect, restrictTo('Vendor', 'Admin'), updateVendorItemFulfillment);

export default router;
