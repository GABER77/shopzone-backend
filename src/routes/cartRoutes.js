import express from 'express';
import cartController from '../controllers/cartController.js';
import authController from '../controllers/authController.js';

const cartRouter = express.Router();

// Protect all routes below this middleware
cartRouter.use(authController.protect);

cartRouter
  .route('/')
  .get(cartController.getCart)
  .delete(cartController.clearCart);

cartRouter
  .route('/:id')
  .post(cartController.addToCart)
  .delete(cartController.removeFromCart);

export default cartRouter;
