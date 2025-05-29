import express from 'express';
import checkoutController from '../controllers/checkoutController.js';
import authController from '../controllers/authController.js';

const checkoutRouter = express.Router();

checkoutRouter.get(
  '/',
  authController.protect,
  checkoutController.getCheckoutSession,
);

export default checkoutRouter;
