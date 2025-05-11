import express from 'express';
import productController from '../controllers/productController.js';

const productRouter = express.Router();

productRouter
  .route('/')
  .get(productController.getAllProducts)
  .post(
    productController.uploadImagesToBuffer,
    productController.resizeAndPushImages,
    productController.createProduct,
  );

productRouter
  .route('/:id')
  .get(productController.getProduct)
  .patch(productController.updateProduct)
  .delete(productController.deleteProduct);

export default productRouter;
