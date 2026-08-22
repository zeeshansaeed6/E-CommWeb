import express from 'express';
import {
  getProducts,
  getFeaturedProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  uploadProductImage,
} from '../controllers/productController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(getProducts)
  .post(protect, restrictTo('Vendor', 'Admin'), createProduct);

router.get('/featured', getFeaturedProducts);

router.post(
  '/upload',
  protect,
  restrictTo('Vendor', 'Admin'),
  upload.array('images', 5),
  uploadProductImage
);

router
  .route('/:id')
  .get(getProductById)
  .put(protect, restrictTo('Vendor', 'Admin'), updateProduct)
  .delete(protect, restrictTo('Vendor', 'Admin'), deleteProduct);

router.route('/:id/reviews').post(protect, createProductReview);

export default router;
