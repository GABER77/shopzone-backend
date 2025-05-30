import Stripe from 'stripe';
import catchAsync from '../utils/catchAsync.js';
import User from '../models/userModel.js';
import Order from '../models/orderModel.js';
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

const createOrder = async (session) => {
  if (!session) {
    throw new CustomError('Session data is missing', 400);
  }

  // 1. Find the user by email (from Stripe session)
  const user = await User.findOne({ email: session.customer_email }).populate({
    path: 'cart.product',
    model: 'Product',
  });

  if (!user || !user.cart || user.cart.length === 0) {
    throw new CustomError(
      'User not found or cart is empty during order creation',
      400,
    );
  }

  // 2. Build products array from user's cart
  const products = user.cart.map((item) => ({
    product: item.product._id,
    quantity: item.quantity,
    price: item.product.price,
    size: item.size,
  }));

  // 3. Create order
  await Order.create({
    user: user._id,
    products,
    amount: session.amount_total / 100, // from cents to dollars
    paymentIntentId: session.payment_intent,
    status: 'completed',
    shippingDetails: {
      name: session.customer_details?.name || '',
      address: session.customer_details?.address?.line1 || '',
      city: session.customer_details?.address?.city || '',
      postalCode: session.customer_details?.address?.postal_code || '',
      country: session.customer_details?.address?.country || '',
    },
  });

  // 4. Clear user's cart
  user.cart = [];
  await user.save({ validateBeforeSave: false });

  console.log('✅ Order created and cart cleared for', user.email);
};

const webhookCheckout = async (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  let event;

  // Webhook signature verification
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
      // I used Stripe CLI to get the STRIPE_WEBHOOK_SECRET and test payment on local host
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful payment
  if (event.type === 'checkout.session.completed')
    await createOrder(event.data.object);

  res.status(200).json({ received: true });
};

const checkoutController = {
  getCheckoutSession,
  webhookCheckout,
};

export default checkoutController;
