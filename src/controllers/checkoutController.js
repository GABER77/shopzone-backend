import Stripe from 'stripe';
import catchAsync from '../utils/catchAsync.js';
import User from '../models/userModel.js';
import CustomError from '../utils/customError.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get user with populated cart
  const user = await User.findById(req.user._id).populate({
    path: 'cart.product',
    model: 'Product',
  });

  if (!user || !user.cart || user.cart.length === 0) {
    throw new CustomError('Your cart is empty or user not found', 400);
  }

  // 2) Build line items from the populated cart
  const lineItems = user.cart.map((item) => {
    const { product } = item;

    if (!product) {
      throw new CustomError(
        `One of the products in your cart was not found`,
        400,
      );
    }

    return {
      price_data: {
        currency: 'usd',
        product_data: {
          name: product.name,
          images: product.images ? [product.images[0]] : [],
        },
        unit_amount: Math.round(product.price * 100), // Stripe expects cents
      },
      quantity: item.quantity,
    };
  });

  // 3) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: user.email,
    line_items: lineItems,
    success_url: `${req.protocol}://localhost:5173/`,
    cancel_url: `${req.protocol}://localhost:5173/cart`,
    shipping_options: [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: 1000, currency: 'usd' }, // $10 delivery
          display_name: 'Standard Delivery',
        },
      },
    ],
    // automatic_tax: { enabled: true },
    // Stripe calculates tax based on customer's address and tax rules
    // Will throw error because we need to add a valid origin address to stripe account
  });

  // 4) Send session to frontend
  res.status(200).json({
    status: 'success',
    session,
  });
});

const checkoutController = {
  getCheckoutSession,
};

export default checkoutController;
