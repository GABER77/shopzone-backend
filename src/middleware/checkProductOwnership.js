import Product from '../models/productModel.js';
import CustomError from '../utils/customError.js';
import catchAsync from '../utils/catchAsync.js';

const checkProductOwnership = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new CustomError('Product not found', 404);
  }

  // Allow admin
  if (req.user.role === 'admin') return next();

  // Only allow the seller who created the product
  if (product.seller.toString() !== req.user._id.toString()) {
    throw new CustomError('You do not own this product', 403);
  }

  next();
});

export default checkProductOwnership;
