import express from 'express';
import productController from '../controllers/productController.js';
import authController from '../controllers/authController.js';

const productRouter = express.Router();

productRouter
  .route('/')
  .get(productController.getAllProducts)
  .post(
    authController.protect,
    authController.restrictTo('seller', 'admin'),
    productController.uploadImagesToBuffer,
    productController.resizeAndCloudinaryUpload,
    productController.createProduct,
  );

productRouter
  .route('/:id')
  .get(productController.getProduct)
  .patch(
    authController.protect,
    authController.restrictTo('seller', 'admin'),
    productController.updateProduct,
  )
  .delete(
    authController.protect,
    authController.restrictTo('seller', 'admin'),
    productController.deleteProduct,
  );

export default productRouter;
