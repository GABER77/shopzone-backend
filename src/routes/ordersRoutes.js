import express from 'express';
import orderController from '../controllers/orderController.js';
import authController from '../controllers/authController.js';

const ordersRouter = express.Router();

ordersRouter.get('/', authController.protect, orderController.getMyOrders);

export default ordersRouter;
