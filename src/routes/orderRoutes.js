import express from 'express';
import orderController from '../controllers/orderController.js';
import authController from '../controllers/authController.js';

const orderRouter = express.Router();

orderRouter.get(
  '/checkout-session',
  authController.protect,
  orderController.getCheckoutSession,
);

export default orderRouter;
