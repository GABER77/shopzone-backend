import express from 'express';
import productController from '../controllers/productController.js';
import authController from '../controllers/authController.js';
import checkProductOwnership from '../middleware/checkProductOwnership.js';

const productRouter = express.Router();

// Public routes (No Authentication Required)
productRouter.route('/').get(productController.getAllProducts);

// Must be defined BEFORE the dynamic '/:id' route to avoid being treated as a product ID
productRouter.get(
  '/my-products',
  authController.protect,
  authController.restrictTo('seller', 'admin'),
  productController.getMyProducts,
);

productRouter.route('/:id').get(productController.getProduct);

// Protect all routes below this middleware
productRouter.use(authController.protect);
productRouter.use(authController.restrictTo('seller', 'admin'));

productRouter
  .route('/')
  .post(
    productController.uploadImagesToBuffer,
    productController.createProductAndUploadImages,
  );

productRouter
  .route('/:id')
  .patch(checkProductOwnership, productController.updateProduct)
  .delete(checkProductOwnership, productController.deleteProduct);

export default productRouter;
