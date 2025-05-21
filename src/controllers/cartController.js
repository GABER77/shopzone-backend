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

const cartController = {
  getCart,
  addToCart,
};

export default cartController;
