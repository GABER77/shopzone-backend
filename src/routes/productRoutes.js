import express from 'express';
import productController from '../controllers/productController.js';
import authController from '../controllers/authController.js';
import checkProductOwnership from '../middleware/checkProductOwnership.js';

const productRouter = express.Router();

// Public routes
productRouter.route('/').get(productController.getAllProducts);
productRouter.route('/:id').get(productController.getProduct);

// Protect all routes below this middleware
productRouter.use(authController.protect);
productRouter.use(authController.restrictTo('seller', 'admin'));

// Protected routes
productRouter
  .route('/')
  .post(
    productController.uploadImagesToBuffer,
    productController.resizeAndCloudinaryUpload,
    productController.createProduct,
  );

productRouter
  .route('/:id')
  .patch(checkProductOwnership, productController.updateProduct)
  .delete(checkProductOwnership, productController.deleteProduct);

export default productRouter;
