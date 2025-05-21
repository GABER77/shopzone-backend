import catchAsync from '../utils/catchAsync.js';
import CustomError from '../utils/customError.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';

const getCart = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate({
    path: 'cart.product',
    select: 'name price images category',
  });

  res.status(200).json({
    status: 'success',
    items: user.cart.length,
    data: {
      cart: user.cart,
    },
  });
});

const addToCart = catchAsync(async (req, res, next) => {
  const productId = req.params.id;
  const { quantity = 1, size } = req.body;

  // Validate that size is provided
  if (size === undefined || size === null) {
    throw new CustomError('Shoe size is required', 400);
  }

  const product = await Product.findById(productId);
  if (!product) throw new CustomError('Product not found', 404);

  const user = await User.findById(req.user._id);

  const cartItem = user.cart.find(
    (item) => item.product.equals(productId) && item.size === size,
  );

  if (cartItem) {
    cartItem.quantity += quantity;
  } else {
    user.cart.push({
      product: productId,
      quantity,
      size,
    });
  }

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: 'Product added to cart',
  });
});

const removeFromCart = catchAsync(async (req, res, next) => {
  const productId = req.params.id;
  const { size } = req.body;

  if (!size) {
    throw new CustomError('Please specify the size to remove', 400);
  }

  const user = await User.findById(req.user._id);

  // It returns the index (position) of that item in the cart
  const cartItemIndex = user.cart.findIndex(
    (item) => item.product.equals(productId) && item.size === size,
  );

  if (cartItemIndex === -1) {
    throw new CustomError('Product not found in cart for this size', 404);
  }

  const cartItem = user.cart[cartItemIndex];

  // Decrease quantity by 1 or remove if it reaches 0
  if (cartItem.quantity > 1) {
    cartItem.quantity -= 1;
  } else {
    user.cart.splice(cartItemIndex, 1);
  }

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: { status: 'success', message: 'Item removed from cart' },
  });
});

const clearCart = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  user.cart = [];
  await user.save({ validateBeforeSave: false });

  res.status(204).send();
});

const cartController = {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
};

export default cartController;
