import express from 'express';
import productController from '../controllers/productController.js';
import authController from '../controllers/authController.js';

const productRouter = express.Router();

productRouter
  .route('/')
  .get(productController.getAllProducts)
  .post(
    authController.protect,
    productController.uploadImagesToBuffer,
    productController.resizeAndCloudinaryUpload,
    productController.createProduct,
  );

productRouter
  .route('/:id')
  .get(productController.getProduct)
  .patch(productController.updateProduct)
  .delete(productController.deleteProduct);

export default productRouter;
