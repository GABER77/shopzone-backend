import express from 'express';
import cartController from '../controllers/cartController.js';
import authController from '../controllers/authController.js';

const router = express.Router();

// Protect all routes below this middleware
router.use(authController.protect);

router.route('/').get(cartController.getCart).delete(cartController.clearCart);

router
  .route('/:productId')
  .post(cartController.addToCart)
  .delete(cartController.removeFromCart);

export default router;
